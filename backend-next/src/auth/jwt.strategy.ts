import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { ConfigService } from '@nestjs/config'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from '../../users/user.entity.js'
import { UserRoleAssignment } from '../entities/user-role-assignment.entity.js'
import { RolePermission } from '../../roles/entities/role-permission.entity.js'

export interface JwtPayload {
  sub: string
  email: string
  tenant_id: string
  roles: string[]
  permissions: string[]
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(UserRoleAssignment)
    private readonly userRoleRepo: Repository<UserRoleAssignment>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET')!,
    })
  }

  async validate(payload: JwtPayload) {
    const user = await this.userRepo.findOne({ where: { id: payload.sub } })
    if (!user || !user.activo) {
      throw new UnauthorizedException('Usuario inactivo o no encontrado')
    }

    const assignments = await this.userRoleRepo.find({
      where: { user_id: payload.sub, tenant_id: payload.tenant_id },
      relations: ['role', 'role.rolePermissions', 'role.rolePermissions.permission'],
    })

    const roleNames = [...new Set(assignments.map(a => a.role.name))]
    const permissions = [
      ...new Set(
        assignments.flatMap(a =>
          a.role.rolePermissions.map((rp: RolePermission) => rp.permission.code),
        ),
      ),
    ]

    return {
      id: user.id,
      email: user.email,
      tenant_id: payload.tenant_id,
      roles: roleNames,
      permissions,
    }
  }
}
