import { Controller, Get, Post, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common'
import { CheckinService } from './checkin.service'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { RolesGuard } from '../common/guards/roles.guard'
import { Roles } from '../common/decorators/roles.decorator'
import { UserRole } from '../users/user.entity'

@Controller('checkin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CheckinController {
  constructor(private readonly checkinService: CheckinService) {}

  @Get('qr/:inscripcionId')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.CHECKIN, UserRole.COORDINATOR, UserRole.DOCENTE)
  generarQr(@Param('inscripcionId', ParseIntPipe) inscripcionId: number) {
    return this.checkinService.generarQrData(inscripcionId)
  }

  @Post('scan')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.CHECKIN, UserRole.COORDINATOR, UserRole.DOCENTE)
  scanQr(@Body() body: { token: string; sesion_id?: number; sala_id?: number; device_info?: string }) {
    return this.checkinService.scanQr(body.token, body.sesion_id, body.sala_id, body.device_info)
  }

  @Post('manual')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.CHECKIN, UserRole.COORDINATOR, UserRole.DOCENTE)
  manual(@Body() body: { inscripcion_id: number; sesion_id?: number; sala_id?: number }) {
    return this.checkinService.checkinManual(body.inscripcion_id, body.sesion_id, body.sala_id)
  }

  @Get('sesion/:sesionId')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DOCENTE, UserRole.CHECKIN, UserRole.COORDINATOR)
  bySesion(@Param('sesionId', ParseIntPipe) sesionId: number) {
    return this.checkinService.checkinsBySesion(sesionId)
  }

  @Get('estadisticas/:cursoId')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DOCENTE, UserRole.COORDINATOR)
  estadisticas(@Param('cursoId', ParseIntPipe) cursoId: number) {
    return this.checkinService.estadisticas(cursoId)
  }
}
