import { Controller, Get, Post, Body, Param, Query, ParseIntPipe, UseGuards } from '@nestjs/common'
import { AsistenciasService } from './asistencias.service.js'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js'
import { RolesGuard } from '../common/guards/roles.guard.js'
import { Roles } from '../common/decorators/roles.decorator.js'
import { UserRole } from '../users/user.entity.js'

@Controller('asistencias')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AsistenciasController {
  constructor(private readonly asistenciasService: AsistenciasService) {}

  @Get(':inscripcionId')
  findByInscripcion(@Param('inscripcionId', ParseIntPipe) inscripcionId: number) {
    return this.asistenciasService.findByInscripcion(inscripcionId)
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.DOCENTE, UserRole.CHECKIN)
  registrar(
    @Body('inscripcion_id') inscripcionId: number,
    @Body('fecha') fecha: string,
    @Body('presente') presente: boolean,
  ) {
    return this.asistenciasService.registrar(inscripcionId, fecha, presente)
  }
}
