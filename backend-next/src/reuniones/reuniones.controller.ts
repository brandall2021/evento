import { Controller, Get, Post, Put, Body, Param, Request, ParseIntPipe, UseGuards } from '@nestjs/common'
import { ReunionesService } from './reuniones.service.js'
import { EstadoReunion } from './reunion.entity.js'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js'
import { RolesGuard } from '../common/guards/roles.guard.js'
import { Roles } from '../common/decorators/roles.decorator.js'
import { UserRole } from '../users/user.entity.js'

@Controller('reuniones')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReunionesController {
  constructor(private readonly reunionesService: ReunionesService) {}

  @Post()
  crear(
    @Request() req: any,
    @Body() body: {
      curso_id: number; titulo: string; descripcion?: string;
      fecha_inicio: string; fecha_fin: string; ubicacion?: string; participantes?: number[]
    },
  ) {
    return this.reunionesService.crear(req.user.id, body)
  }

  @Get('curso/:cursoId')
  byCurso(@Param('cursoId', ParseIntPipe) cursoId: number) {
    return this.reunionesService.findByCurso(cursoId)
  }

  @Get('mis')
  misReuniones(@Request() req: any) {
    return this.reunionesService.misReuniones(req.user.id)
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.reunionesService.findById(id)
  }

  @Put(':id/responder')
  responder(@Param('id', ParseIntPipe) id: number, @Request() req: any, @Body('aceptar') aceptar: boolean) {
    return this.reunionesService.responder(id, req.user.id, aceptar)
  }

  @Put(':id/estado')
  @Roles(UserRole.ADMIN, UserRole.COORDINATOR)
  cambiarEstado(@Param('id', ParseIntPipe) id: number, @Body('estado') estado: EstadoReunion) {
    return this.reunionesService.cambiarEstado(id, estado)
  }

  @Get(':id/participantes')
  participantes(@Param('id', ParseIntPipe) id: number) {
    return this.reunionesService.participantes(id)
  }
}
