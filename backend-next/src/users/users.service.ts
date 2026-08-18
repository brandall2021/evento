import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import * as bcrypt from 'bcryptjs'
import { User } from './entities/user.entity.js'
import { UserTenant } from './entities/user-tenant.entity.js'
import { UserRole } from './entities/user-role.entity.js'
import { RefreshToken } from './entities/refresh-token.entity.js'
import { CreateUserDto } from './dto/create-user.dto.js'
import { UpdateUserDto } from './dto/update-user.dto.js'
import { UserResponseDto } from './dto/user-response.dto.js'
import { AssignRoleDto } from './dto/assign-role.dto.js'
import { PageDto, PaginatedResponseDto } from '../common/dto/pagination.dto.js'

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(UserTenant)
    private readonly userTenantRepo: Repository<UserTenant>,
    @InjectRepository(UserRole)
    private readonly userRoleRepo: Repository<UserRole>,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepo: Repository<RefreshToken>,
  ) {}

  async create(dto: CreateUserDto): Promise<UserResponseDto> {
    const exists = await this.userRepo.findOne({ where: { email: dto.email } })
    if (exists) {
      throw new ConflictException('El email ya está registrado')
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10)
    const user = this.userRepo.create({
      email: dto.email,
      password_hash: hashedPassword,
      first_name: dto.firstName,
      last_name: dto.lastName,
      phone: dto.phone ?? null,
      avatar_url: dto.avatarUrl ?? null,
    })

    const saved = await this.userRepo.save(user)
    return this.toResponseDto(saved)
  }

  async findAll(
    pageDto: PageDto,
    filters?: { tenantId?: string; isActive?: string },
  ): Promise<PaginatedResponseDto<UserResponseDto>> {
    const qb = this.userRepo.createQueryBuilder('user')

    if (filters?.tenantId) {
      qb.innerJoin('user.user_tenants', 'ut', 'ut.tenant_id = :tenantId AND ut.is_active = true', {
        tenantId: filters.tenantId,
      })
    }

    if (filters?.isActive !== undefined) {
      qb.andWhere('user.is_active = :isActive', { isActive: filters.isActive === 'true' })
    }

    qb.orderBy('user.created_at', 'DESC')
      .skip(pageDto.skip)
      .take(pageDto.limit)

    const [users, total] = await qb.getManyAndCount()
    const data = users.map(u => this.toResponseDto(u))

    return new PaginatedResponseDto(data, total, pageDto.page, pageDto.limit)
  }

  async findOne(id: string): Promise<UserResponseDto> {
    const user = await this.userRepo.findOne({ where: { id } })
    if (!user) {
      throw new NotFoundException('Usuario no encontrado')
    }
    return this.toResponseDto(user)
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepo.findOne({
      where: { email },
      select: ['id', 'email', 'password_hash', 'first_name', 'last_name', 'is_active'],
    })
  }

  async update(id: string, dto: UpdateUserDto): Promise<UserResponseDto> {
    const user = await this.userRepo.findOne({ where: { id } })
    if (!user) {
      throw new NotFoundException('Usuario no encontrado')
    }

    if (dto.email && dto.email !== user.email) {
      const exists = await this.userRepo.findOne({ where: { email: dto.email } })
      if (exists) {
        throw new ConflictException('El email ya está registrado')
      }
    }

    if (dto.password) {
      user.password_hash = await bcrypt.hash(dto.password, 10)
    }

    if (dto.firstName !== undefined) user.first_name = dto.firstName
    if (dto.lastName !== undefined) user.last_name = dto.lastName
    if (dto.email !== undefined) user.email = dto.email
    if (dto.phone !== undefined) user.phone = dto.phone ?? null
    if (dto.avatarUrl !== undefined) user.avatar_url = dto.avatarUrl ?? null
    if (dto.is_active !== undefined) user.is_active = dto.is_active

    const saved = await this.userRepo.save(user)
    return this.toResponseDto(saved)
  }

  async remove(id: string): Promise<{ message: string }> {
    const user = await this.userRepo.findOne({ where: { id } })
    if (!user) {
      throw new NotFoundException('Usuario no encontrado')
    }

    await this.userRepo.softDelete(id)
    return { message: 'Usuario eliminado' }
  }

  async assignRole(userId: string, dto: AssignRoleDto): Promise<UserRole> {
    const user = await this.userRepo.findOne({ where: { id: userId } })
    if (!user) {
      throw new NotFoundException('Usuario no encontrado')
    }

    const existing = await this.userRoleRepo.findOne({
      where: {
        user_id: userId,
        role_id: dto.roleId,
        tenant_id: dto.tenantId,
      },
    })

    if (existing) {
      throw new ConflictException('El usuario ya tiene este rol en el tenant')
    }

    let userTenant = await this.userTenantRepo.findOne({
      where: { user_id: userId, tenant_id: dto.tenantId },
    })

    if (!userTenant) {
      userTenant = this.userTenantRepo.create({
        user_id: userId,
        tenant_id: dto.tenantId,
        is_active: true,
      })
      await this.userTenantRepo.save(userTenant)
    }

    const userRole = this.userRoleRepo.create({
      user_id: userId,
      role_id: dto.roleId,
      tenant_id: dto.tenantId,
    })

    return this.userRoleRepo.save(userRole)
  }

  async removeRole(userId: string, roleId: string): Promise<{ message: string }> {
    const user = await this.userRepo.findOne({ where: { id: userId } })
    if (!user) {
      throw new NotFoundException('Usuario no encontrado')
    }

    const result = await this.userRoleRepo.delete({ user_id: userId, role_id: roleId })
    if (result.affected === 0) {
      throw new NotFoundException('Rol no encontrado para este usuario')
    }

    return { message: 'Rol revocado' }
  }

  private toResponseDto(user: User): UserResponseDto {
    return new UserResponseDto({
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      phone: user.phone,
      avatarUrl: user.avatar_url,
      isActive: user.is_active,
      createdAt: user.created_at,
    })
  }
}
