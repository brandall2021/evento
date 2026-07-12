import { Controller, Get, Post, Put, Body, Param, Query, Request, ParseIntPipe, UseGuards } from '@nestjs/common'
import { InscripcionesService } from './inscripciones.service.js'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js'
import { RolesGuard } from '../common/guards/roles.guard.js'
import { Roles } from '../common/decorators/roles.decorator.js'
import { UserRole } from '../users/user.entity.js'

@Controller('inscripciones')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InscripcionesController {
  constructor(private readonly inscripcionesService: InscripcionesService) {}

  @Post()
  solicitar(@Body('curso_id') cursoId: number, @Request() req: any) {
    return this.inscripcionesService.solicitar(cursoId, req.user.id)
  }

  @Get('mis')
  misInscripciones(@Request() req: any) {
    return this.inscripcionesService.misInscripciones(req.user.id)
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.DOCENTE)
  findAll(
    @Request() req: any,
    @Query('curso_id') cursoId?: string,
    @Query('estado') estado?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.inscripcionesService.findAll(req.user, {
      curso_id: cursoId ? parseInt(cursoId) : undefined,
      estado,
      page: page ? parseInt(page) : undefined,
      pageSize: pageSize ? parseInt(pageSize) : undefined,
    })
  }

  @Put(':id/aprobar')
  @Roles(UserRole.ADMIN)
  aprobar(@Param('id', ParseIntPipe) id: number) {
    return this.inscripcionesService.aprobar(id)
  }

  @Put(':id/rechazar')
  @Roles(UserRole.ADMIN)
  rechazar(@Param('id', ParseIntPipe) id: number, @Body('motivo') motivo?: string) {
    return this.inscripcionesService.rechazar(id, motivo)
  }
}
