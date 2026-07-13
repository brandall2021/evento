import { Controller, Get, Param, Query, UseGuards, Req } from '@nestjs/common'
import { AuditLogsService } from './audit-logs.service.js'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js'
import { RolesGuard } from '../common/guards/roles.guard.js'
import { Roles } from '../common/decorators/roles.decorator.js'
import { UserRole } from '../users/user.entity.js'

@Controller('audit-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  @Get()
  findAll(@Query('page') page?: string, @Query('pageSize') pageSize?: string) {
    return this.auditLogsService.findAll(page ? parseInt(page) : undefined, pageSize ? parseInt(pageSize) : undefined)
  }

  @Get('entidad/:entidad')
  byEntidad(@Param('entidad') entidad: string) {
    return this.auditLogsService.byEntidad(entidad)
  }

  @Get('usuario/:id')
  byUser(@Param('id') id: string) {
    return this.auditLogsService.byUser(parseInt(id))
  }
}
