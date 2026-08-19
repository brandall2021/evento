import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common'
import { AuditService } from './audit.service.js'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js'
import { RolesGuard } from '../common/guards/roles.guard.js'
import { Roles } from '../common/decorators/roles.decorator.js'
import { UserRole } from '../users/user.entity.js'

@Controller('audit-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AuditLogsController {
  constructor(private readonly auditService: AuditService) {}

  @Get('entity/:entity')
  findByEntity(
    @Param('entity') entity: string,
    @Query('entity_id') entityId?: string,
  ) {
    return this.auditService.findByEntity(entity, entityId)
  }

  @Get('user/:userId')
  findByUser(@Param('userId') userId: string) {
    return this.auditService.findByUser(userId)
  }
}
