import { Controller, Get, Post, Put, Delete, Body, Param, Query, ParseIntPipe, UseGuards } from '@nestjs/common'
import { AgendaService } from './agenda.service.js'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js'
import { RolesGuard } from '../common/guards/roles.guard.js'
import { Roles } from '../common/decorators/roles.decorator.js'
import { UserRole } from '../users/user.entity.js'

@Controller('cursos/:cursoId')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AgendaController {
  constructor(private readonly agendaService: AgendaService) {}

  // --- Dias ---
  @Post('dias')
  @Roles(UserRole.ADMIN, UserRole.DOCENTE, UserRole.COORDINATOR)
  crearDia(@Param('cursoId', ParseIntPipe) cursoId: number, @Body() body: { fecha: string; titulo: string; orden?: number }) {
    return this.agendaService.crearDia(cursoId, body)
  }

  @Get('dias')
  diasByCurso(@Param('cursoId', ParseIntPipe) cursoId: number) {
    return this.agendaService.diasByCurso(cursoId)
  }

  // --- Salas ---
  @Post('salas')
  @Roles(UserRole.ADMIN, UserRole.DOCENTE, UserRole.COORDINATOR)
  crearSala(@Param('cursoId', ParseIntPipe) cursoId: number, @Body() body: { nombre: string; capacidad?: number; ubicacion?: string }) {
    return this.agendaService.crearSala(cursoId, body)
  }

  @Get('salas')
  salasByCurso(@Param('cursoId', ParseIntPipe) cursoId: number) {
    return this.agendaService.salasByCurso(cursoId)
  }

  // --- Full agenda ---
  @Get('agenda')
  agendaCompleta(@Param('cursoId', ParseIntPipe) cursoId: number) {
    return this.agendaService.agendaCompleta(cursoId)
  }
}

@Controller('dias')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DiaController {
  constructor(private readonly agendaService: AgendaService) {}

  @Put(':id')
  @Roles(UserRole.ADMIN, UserRole.DOCENTE, UserRole.COORDINATOR)
  actualizar(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.agendaService.actualizarDia(id, body)
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.DOCENTE, UserRole.COORDINATOR)
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.agendaService.eliminarDia(id)
  }

  @Post(':diaId/bloques')
  @Roles(UserRole.ADMIN, UserRole.DOCENTE, UserRole.COORDINATOR)
  crearBloque(@Param('diaId', ParseIntPipe) diaId: number, @Body() body: { titulo: string; hora_inicio: string; hora_fin: string }) {
    return this.agendaService.crearBloque(diaId, body)
  }

  @Get(':diaId/bloques')
  bloquesByDia(@Param('diaId', ParseIntPipe) diaId: number) {
    return this.agendaService.bloquesByDia(diaId)
  }
}

@Controller('bloques')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BloqueController {
  constructor(private readonly agendaService: AgendaService) {}

  @Put(':id')
  @Roles(UserRole.ADMIN, UserRole.DOCENTE, UserRole.COORDINATOR)
  actualizar(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.agendaService.actualizarBloque(id, body)
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.DOCENTE, UserRole.COORDINATOR)
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.agendaService.eliminarBloque(id)
  }

  @Post(':bloqueId/sesiones')
  @Roles(UserRole.ADMIN, UserRole.DOCENTE, UserRole.COORDINATOR)
  crearSesion(@Param('bloqueId', ParseIntPipe) bloqueId: number, @Body() body: {
    titulo: string; descripcion?: string; sala_id?: number; ponente_id?: number; tipo?: string; cupos?: number
  }) {
    return this.agendaService.crearSesion(bloqueId, body)
  }

  @Get(':bloqueId/sesiones')
  sesionesByBloque(@Param('bloqueId', ParseIntPipe) bloqueId: number) {
    return this.agendaService.sesionesByBloque(bloqueId)
  }
}

@Controller('salas')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SalaController {
  constructor(private readonly agendaService: AgendaService) {}

  @Put(':id')
  @Roles(UserRole.ADMIN, UserRole.DOCENTE, UserRole.COORDINATOR)
  actualizar(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.agendaService.actualizarSala(id, body)
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.DOCENTE, UserRole.COORDINATOR)
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.agendaService.eliminarSala(id)
  }
}

@Controller('sesiones')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SesionController {
  constructor(private readonly agendaService: AgendaService) {}

  @Put(':id')
  @Roles(UserRole.ADMIN, UserRole.DOCENTE, UserRole.COORDINATOR)
  actualizar(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.agendaService.actualizarSesion(id, body)
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.DOCENTE, UserRole.COORDINATOR)
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.agendaService.eliminarSesion(id)
  }
}
