import { Controller, Get, Post, Body, Param, Query, ParseIntPipe, UseGuards } from '@nestjs/common'
import { AsistenciasService } from './asistencias.service'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { RolesGuard } from '../common/guards/roles.guard'
import { Roles } from '../common/decorators/roles.decorator'
import { UserRole } from '../users/user.entity'

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
