import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  GoneException,
  ForbiddenException,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import * as bcrypt from 'bcryptjs'
import { createHash, randomBytes } from 'node:crypto'
import { User } from '../users/entities/user.entity'
import { RefreshToken } from '../users/entities/refresh-token.entity'
import { UserTenant } from '../users/entities/user-tenant.entity'
import { UserRole } from '../users/entities/user-role.entity'
import { Role } from '../roles/entities/role.entity'
import { AuthResponseDto } from './dto/auth-response.dto'
import { JwtPayload } from './jwt.strategy'

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepo: Repository<RefreshToken>,
    @InjectRepository(UserTenant)
    private readonly userTenantRepo: Repository<UserTenant>,
    @InjectRepository(UserRole)
    private readonly userRoleRepo: Repository<UserRole>,
    @InjectRepository(Role)
    private readonly roleRepo: Repository<Role>,
    private readonly jwtService: JwtService,
  ) {}

  async register(data: {
    email: string
    password: string
    firstName: string
    lastName: string
  }): Promise<AuthResponseDto> {
    const existing = await this.userRepo.findOne({ where: { email: data.email } })
    if (existing) {
      throw new ConflictException('El email ya está registrado')
    }

    const hashedPassword = await bcrypt.hash(data.password, 10)
    const user = this.userRepo.create({
      email: data.email,
      password_hash: hashedPassword,
      first_name: data.firstName,
      last_name: data.lastName,
    })
    const saved = await this.userRepo.save(user)

    return this.buildAuthResponse(saved)
  }

  async login(email: string, password: string): Promise<AuthResponseDto> {
    const user = await this.userRepo.findOne({
      where: { email },
      select: ['id', 'email', 'password_hash', 'first_name', 'last_name', 'is_active'],
    })

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas')
    }

    if (!user.is_active) {
      throw new UnauthorizedException('Usuario inactivo')
    }

    const match = await bcrypt.compare(password, user.password_hash)
    if (!match) {
      throw new UnauthorizedException('Credenciales inválidas')
    }

    return this.buildAuthResponse(user)
  }

  async refresh(refreshToken: string): Promise<AuthResponseDto> {
    const tokenHash = this.hashToken(refreshToken)

    const stored = await this.refreshTokenRepo.findOne({
      where: { token_hash: tokenHash },
      relations: ['user'],
    })

    if (!stored || stored.revoked_at) {
      throw new UnauthorizedException('Refresh token inválido o revocado')
    }

    if (new Date() > stored.expires_at) {
      throw new GoneException('Refresh token expirado')
    }

    if (!stored.user.is_active) {
      throw new ForbiddenException('Usuario inactivo')
    }

    stored.revoked_at = new Date()
    await this.refreshTokenRepo.save(stored)

    return this.buildAuthResponse(stored.user)
  }

  async logout(refreshToken: string): Promise<{ message: string }> {
    const tokenHash = this.hashToken(refreshToken)

    const stored = await this.refreshTokenRepo.findOne({
      where: { token_hash: tokenHash },
    })

    if (stored && !stored.revoked_at) {
      stored.revoked_at = new Date()
      await this.refreshTokenRepo.save(stored)
    }

    return { message: 'Sesión cerrada' }
  }

  async getMe(userId: string) {
    const user = await this.userRepo.findOne({
      where: { id: userId },
    })

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado')
    }

    const tenants = await this.userTenantRepo.find({
      where: { user_id: userId, is_active: true },
      relations: ['tenant'],
    })

    const tenantsWithRoles = await Promise.all(
      tenants.map(async t => ({
        tenant_id: t.tenant_id,
        tenant_name: t.tenant.name,
        ...(await this.getUserRBAC(userId, t.tenant_id)),
      })),
    )

    return {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      avatarUrl: user.avatar_url,
      tenants: tenantsWithRoles,
    }
  }

  async getUserRBAC(userId: string, tenantId: string) {
    if (!tenantId) {
      return { roles: [], permissions: [] }
    }

    const assignments = await this.userRoleRepo.find({
      where: { user_id: userId, tenant_id: tenantId },
      relations: ['role', 'role.rolePermissions', 'role.rolePermissions.permission'],
    })

    const roles = [...new Set(assignments.map(a => a.role.name))]
    const permissions = [
      ...new Set(
        assignments.flatMap(a =>
          a.role.rolePermissions.map((rp: any) => rp.permission.code),
        ),
      ),
    ]

    return { roles, permissions }
  }

  private async buildAuthResponse(user: User): Promise<AuthResponseDto> {
    const firstTenant = await this.userTenantRepo.findOne({
      where: { user_id: user.id, is_active: true },
    })

    const tenantId = firstTenant?.tenant_id ?? ''

    const rbac = tenantId
      ? await this.getUserRBAC(user.id, tenantId)
      : { roles: [], permissions: [] }

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      tenant_id: tenantId,
      roles: rbac.roles,
      permissions: rbac.permissions,
    }

    const accessToken = this.jwtService.sign(payload)
    const refreshToken = await this.createRefreshToken(user)

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        avatarUrl: user.avatar_url ?? null,
      },
    }
  }

  private async createRefreshToken(user: User): Promise<string> {
    const raw = randomBytes(40).toString('hex')
    const tokenHash = this.hashToken(raw)

    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)

    const entity = this.refreshTokenRepo.create({
      user_id: user.id,
      token_hash: tokenHash,
      expires_at: expiresAt,
    })
    await this.refreshTokenRepo.save(entity)

    return raw
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex')
  }
}
