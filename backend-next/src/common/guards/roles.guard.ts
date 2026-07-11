import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { UserRole } from '../../users/user.entity.js'
import { ROLES_KEY } from '../decorators/roles.decorator.js'

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ])

    if (!requiredRoles || requiredRoles.length === 0) return true

    const { user } = context.switchToHttp().getRequest()
    if (!user) throw new ForbiddenException('No autorizado')

    const hasRole = requiredRoles.some(role => user.rol === role)
    if (!hasRole) throw new ForbiddenException('No autorizado')

    return true
  }
}
