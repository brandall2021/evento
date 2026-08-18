import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Role } from './entities/role.entity.js'
import { RolePermission } from './entities/role-permission.entity.js'
import { PermissionsService } from '../permissions/permissions.service.js'
import { CreateRoleDto } from './dto/create-role.dto.js'
import { UpdateRoleDto } from './dto/update-role.dto.js'

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepo: Repository<Role>,
    @InjectRepository(RolePermission)
    private readonly rpRepo: Repository<RolePermission>,
    private readonly permissionsService: PermissionsService,
  ) {}

  async create(tenantId: string, dto: CreateRoleDto): Promise<Role> {
    const existing = await this.roleRepo.findOne({
      where: { tenant_id: tenantId, name: dto.name },
    })
    if (existing) {
      throw new ConflictException(`Role "${dto.name}" already exists in this tenant`)
    }

    const role = this.roleRepo.create({
      tenant_id: tenantId,
      name: dto.name,
      description: dto.description ?? null,
    })
    const saved = await this.roleRepo.save(role)

    if (dto.permissionIds?.length) {
      await this.assignPermissions(saved.id, dto.permissionIds)
    }

    return this.findOne(tenantId, saved.id)
  }

  async findAll(tenantId: string): Promise<Role[]> {
    return this.roleRepo.find({
      where: { tenant_id: tenantId },
      order: { name: 'ASC' },
    })
  }

  async findOne(tenantId: string, id: string): Promise<Role> {
    const role = await this.roleRepo.findOne({
      where: { id, tenant_id: tenantId },
      relations: ['rolePermissions', 'rolePermissions.permission'],
    })
    if (!role) {
      throw new NotFoundException(`Role ${id} not found in this tenant`)
    }
    return role
  }

  async update(tenantId: string, id: string, dto: UpdateRoleDto): Promise<Role> {
    const role = await this.findOne(tenantId, id)

    if (role.is_system && dto.name && dto.name !== role.name) {
      throw new BadRequestException('Cannot rename a system role')
    }

    if (dto.name) {
      const existing = await this.roleRepo.findOne({
        where: { tenant_id: tenantId, name: dto.name },
      })
      if (existing && existing.id !== id) {
        throw new ConflictException(`Role "${dto.name}" already exists in this tenant`)
      }
    }

    if (dto.name !== undefined) role.name = dto.name
    if (dto.description !== undefined) role.description = dto.description ?? null
    await this.roleRepo.save(role)

    if (dto.permissionIds !== undefined) {
      await this.assignPermissions(id, dto.permissionIds)
    }

    return this.findOne(tenantId, id)
  }

  async remove(tenantId: string, id: string): Promise<{ message: string }> {
    const role = await this.findOne(tenantId, id)

    if (role.is_system) {
      throw new BadRequestException('Cannot delete a system role')
    }

    await this.roleRepo.remove(role)
    return { message: 'Role deleted' }
  }

  async assignPermissions(roleId: string, permissionIds: string[]): Promise<RolePermission[]> {
    await this.rpRepo.delete({ role_id: roleId })

    if (!permissionIds.length) return []

    const validPerms = await this.permissionsService.findByIds(permissionIds)
    if (validPerms.length !== permissionIds.length) {
      throw new BadRequestException('One or more permission IDs are invalid')
    }

    const entities = permissionIds.map(permission_id =>
      this.rpRepo.create({ role_id: roleId, permission_id }),
    )
    return this.rpRepo.save(entities)
  }

  async getPermissionsByRoleId(roleId: string): Promise<RolePermission[]> {
    return this.rpRepo.find({
      where: { role_id: roleId },
      relations: ['permission'],
    })
  }
}
