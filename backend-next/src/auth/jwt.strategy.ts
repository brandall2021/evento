import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { ConfigService } from '@nestjs/config'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from '../users/entities/user.entity'
import { AuthService } from './auth.service'

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
    private readonly authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET')!,
    })
  }

  async validate(payload: JwtPayload) {
    const user = await this.userRepo.findOne({ where: { id: payload.sub } })
    if (!user || !user.is_active) {
      throw new UnauthorizedException('Usuario inactivo o no encontrado')
    }

    const rbac = await this.authService.getUserRBAC(payload.sub, payload.tenant_id)

    return {
      id: user.id,
      email: user.email,
      tenant_id: payload.tenant_id,
      roles: rbac.roles,
      permissions: rbac.permissions,
    }
  }
}
