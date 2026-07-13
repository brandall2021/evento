import { Controller, Get, Post, Body, Param, Query, Request, ParseIntPipe, UseGuards } from '@nestjs/common'
import { GamificacionService } from './gamificacion.service.js'
import { FuentePuntos } from './puntos-historial.entity.js'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js'
import { RolesGuard } from '../common/guards/roles.guard.js'
import { Roles } from '../common/decorators/roles.decorator.js'
import { UserRole } from '../users/user.entity.js'

@Controller('gamificacion')
@UseGuards(JwtAuthGuard, RolesGuard)
export class GamificacionController {
  constructor(private readonly gamificacionService: GamificacionService) {}

  @Post('puntos')
  @Roles(UserRole.ADMIN)
  agregarPuntos(
    @Body() body: { user_id: number; puntos: number; fuente: string; referencia_id?: number; descripcion?: string },
  ) {
    return this.gamificacionService.agregarPuntos(body.user_id, body.puntos, body.fuente as FuentePuntos, body.referencia_id, body.descripcion)
  }

  @Get('mis-puntos')
  misPuntos(@Request() req: any) {
    return this.gamificacionService.puntosTotales(req.user.id)
  }

  @Get('historial')
  historial(
    @Request() req: any,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.gamificacionService.historial(req.user.id, page ? parseInt(page) : undefined, pageSize ? parseInt(pageSize) : undefined)
  }

  @Get('ranking')
  ranking(@Query('curso_id') cursoId?: string, @Query('limit') limit?: string) {
    return this.gamificacionService.ranking(cursoId ? parseInt(cursoId) : undefined, limit ? parseInt(limit) : undefined)
  }

  @Get('badges')
  badges() {
    return this.gamificacionService.badgesDisponibles()
  }

  @Get('mis-badges')
  misBadges(@Request() req: any) {
    return this.gamificacionService.misBadges(req.user.id)
  }

  @Post('badges')
  @Roles(UserRole.ADMIN)
  crearBadge(@Body() body: { nombre: string; descripcion?: string; imagen_url?: string; icono?: string; puntos_requeridos?: number }) {
    return this.gamificacionService.crearBadge(body)
  }

  @Post('badges/:badgeId/otorgar')
  @Roles(UserRole.ADMIN)
  otorgarBadge(
    @Body('user_id') userId: number,
    @Param('badgeId', ParseIntPipe) badgeId: number,
    @Body('curso_id') cursoId?: number,
  ) {
    return this.gamificacionService.otorgarBadge(userId, badgeId, cursoId)
  }
}
