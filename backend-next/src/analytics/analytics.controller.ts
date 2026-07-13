import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common'
import { AnalyticsService } from './analytics.service.js'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js'
import { RolesGuard } from '../common/guards/roles.guard.js'
import { Roles } from '../common/decorators/roles.decorator.js'
import { UserRole } from '../users/user.entity.js'

@Controller('analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  @Roles(UserRole.ADMIN)
  dashboard() {
    return this.analyticsService.dashboard()
  }

  @Get('cursos-por-estado')
  @Roles(UserRole.ADMIN)
  cursosPorEstado() {
    return this.analyticsService.cursosPorEstado()
  }

  @Get('inscripciones-por-mes')
  @Roles(UserRole.ADMIN)
  inscripcionesPorMes() {
    return this.analyticsService.inscripcionesPorMes()
  }

  @Get('pagos-por-mes')
  @Roles(UserRole.ADMIN)
  pagosPorMes() {
    return this.analyticsService.pagosPorMes()
  }

  @Get('top-cursos')
  @Roles(UserRole.ADMIN)
  topCursos(@Query('limit') limit?: string) {
    return this.analyticsService.topCursos(limit ? parseInt(limit) : undefined)
  }

  @Get('asistencia-curso/:id')
  @Roles(UserRole.ADMIN, UserRole.DOCENTE)
  asistenciaPorCurso(@Param('id') id: string) {
    return this.analyticsService.asistenciaPorCurso(parseInt(id))
  }

  @Get('usuario/:id')
  @Roles(UserRole.ADMIN)
  usuarioStats(@Param('id') id: string) {
    return this.analyticsService.usuarioStats(parseInt(id))
  }
}
