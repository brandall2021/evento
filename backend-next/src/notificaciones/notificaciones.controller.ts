import { Controller, Get, Post, Put, Body, Param, Query, Request, ParseIntPipe, UseGuards } from '@nestjs/common'
import { NotificacionesService } from './notificaciones.service.js'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js'
import { RolesGuard } from '../common/guards/roles.guard.js'
import { Roles } from '../common/decorators/roles.decorator.js'
import { UserRole } from '../users/user.entity.js'

@Controller('notificaciones')
@UseGuards(JwtAuthGuard, RolesGuard)
export class NotificacionesController {
  constructor(private readonly notificacionesService: NotificacionesService) {}

  @Post('enviar')
  @Roles(UserRole.ADMIN)
  enviar(@Body() body: {
    user_id: number; titulo: string; contenido: string; canal?: string;
    referencia_tipo?: string; referencia_id?: number; metadata?: Record<string, any>
  }) {
    return this.notificacionesService.enviar(body.user_id, body)
  }

  @Post('enviar-masiva')
  @Roles(UserRole.ADMIN)
  enviarMasiva(@Body() body: {
    user_ids: number[]; titulo: string; contenido: string; canal?: string;
    referencia_tipo?: string; referencia_id?: number
  }) {
    return this.notificacionesService.enviarMasiva(body.user_ids, body)
  }

  @Get('mis')
  mis(@Request() req: any, @Query('page') page?: string, @Query('pageSize') pageSize?: string) {
    return this.notificacionesService.misNotificaciones(req.user.id, page ? parseInt(page) : undefined, pageSize ? parseInt(pageSize) : undefined)
  }

  @Put(':id/leer')
  marcarLeida(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.notificacionesService.marcarLeida(id, req.user.id)
  }

  @Put('leer-todas')
  marcarTodas(@Request() req: any) {
    return this.notificacionesService.marcarTodasLeidas(req.user.id)
  }

  @Get('no-leidas')
  noLeidas(@Request() req: any) {
    return this.notificacionesService.noLeidas(req.user.id)
  }

  @Post('plantillas')
  @Roles(UserRole.ADMIN)
  crearPlantilla(@Body() body: {
    nombre: string; canal: string; asunto: string; cuerpo: string; variables?: string[]
  }) {
    return this.notificacionesService.crearPlantilla(body)
  }

  @Get('plantillas')
  @Roles(UserRole.ADMIN)
  plantillas() {
    return this.notificacionesService.plantillas()
  }

  @Post('plantillas/:id/usar')
  @Roles(UserRole.ADMIN)
  usarPlantilla(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { user_id: number; variables: Record<string, string> },
  ) {
    return this.notificacionesService.usarPlantilla(id, body.user_id, body.variables)
  }
}
