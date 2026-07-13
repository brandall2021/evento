import { Controller, Get, Post, Delete, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common'
import { PermissionsService } from './permissions.service.js'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js'
import { RolesGuard } from '../common/guards/roles.guard.js'
import { Roles } from '../common/decorators/roles.decorator.js'
import { UserRole } from '../users/user.entity.js'

@Controller('permissions')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Post()
  crear(@Body() body: { nombre: string; clave: string; descripcion?: string; categoria?: string }) {
    return this.permissionsService.crear(body)
  }

  @Get()
  findAll() {
    return this.permissionsService.findAll()
  }

  @Post('rol/:rol')
  asignarRol(@Param('rol') rol: string, @Body() body: { permission_id: number }) {
    return this.permissionsService.asignarRol(rol, body.permission_id)
  }

  @Delete('rol/:rol/:permissionId')
  removerRol(@Param('rol') rol: string, @Param('permissionId', ParseIntPipe) permissionId: number) {
    return this.permissionsService.removerRol(rol, permissionId)
  }

  @Get('rol/:rol')
  permisosDeRol(@Param('rol') rol: string) {
    return this.permissionsService.permisosDeRol(rol)
  }
}
