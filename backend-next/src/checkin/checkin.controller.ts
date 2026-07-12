import { Controller, Get, Post, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common'
import { CheckinService } from './checkin.service.js'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js'
import { RolesGuard } from '../common/guards/roles.guard.js'
import { Roles } from '../common/decorators/roles.decorator.js'
import { UserRole } from '../users/user.entity.js'

@Controller('checkin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CheckinController {
  constructor(private readonly checkinService: CheckinService) {}

  @Get('qr/:inscripcionId')
  generarQr(@Param('inscripcionId', ParseIntPipe) inscripcionId: number) {
    return this.checkinService.generarQrData(inscripcionId)
  }

  @Post('scan')
  @Roles(UserRole.ADMIN, UserRole.CHECKIN, UserRole.COORDINATOR)
  scanQr(@Body() body: { token: string; sesion_id?: number; sala_id?: number; device_info?: string }) {
    return this.checkinService.scanQr(body.token, body.sesion_id, body.sala_id, body.device_info)
  }

  @Post('manual')
  @Roles(UserRole.ADMIN, UserRole.CHECKIN, UserRole.COORDINATOR)
  manual(@Body() body: { inscripcion_id: number; sesion_id?: number; sala_id?: number }) {
    return this.checkinService.checkinManual(body.inscripcion_id, body.sesion_id, body.sala_id)
  }

  @Get('sesion/:sesionId')
  @Roles(UserRole.ADMIN, UserRole.DOCENTE, UserRole.CHECKIN, UserRole.COORDINATOR)
  bySesion(@Param('sesionId', ParseIntPipe) sesionId: number) {
    return this.checkinService.checkinsBySesion(sesionId)
  }

  @Get('estadisticas/:cursoId')
  @Roles(UserRole.ADMIN, UserRole.DOCENTE, UserRole.COORDINATOR)
  estadisticas(@Param('cursoId', ParseIntPipe) cursoId: number) {
    return this.checkinService.estadisticas(cursoId)
  }
}
