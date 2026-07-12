import { Controller, Get, Post, Put, Body, Param, Request, ParseIntPipe, UseGuards } from '@nestjs/common'
import { StreamingService } from './streaming.service.js'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js'
import { RolesGuard } from '../common/guards/roles.guard.js'
import { Roles } from '../common/decorators/roles.decorator.js'
import { UserRole } from '../users/user.entity.js'

@Controller('streaming')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StreamingController {
  constructor(private readonly streamingService: StreamingService) {}

  // --- Salas ---
  @Post('salas')
  @Roles(UserRole.ADMIN, UserRole.DOCENTE, UserRole.COORDINATOR)
  crearSala(@Param('cursoId', ParseIntPipe) cursoId: number, @Body() body: {
    titulo: string; plataforma: string; sesion_id?: number; url_stream?: string; url_chat?: string
  }) {
    return this.streamingService.crearSala(cursoId, body)
  }

  @Get('salas/curso/:cursoId')
  salasByCurso(@Param('cursoId', ParseIntPipe) cursoId: number) {
    return this.streamingService.salasByCurso(cursoId)
  }

  @Get('salas/:id')
  salaById(@Param('id', ParseIntPipe) id: number) {
    return this.streamingService.salaById(id)
  }

  @Put('salas/:id/activar')
  @Roles(UserRole.ADMIN, UserRole.DOCENTE)
  activar(@Param('id', ParseIntPipe) id: number) {
    return this.streamingService.activarDesactivar(id, true)
  }

  @Put('salas/:id/desactivar')
  @Roles(UserRole.ADMIN, UserRole.DOCENTE)
  desactivar(@Param('id', ParseIntPipe) id: number) {
    return this.streamingService.activarDesactivar(id, false)
  }

  // --- Encuestas ---
  @Post('salas/:salaId/encuestas')
  @Roles(UserRole.ADMIN, UserRole.DOCENTE, UserRole.MODERATOR)
  crearEncuesta(@Param('salaId', ParseIntPipe) salaId: number, @Body() body: { titulo: string; opciones: string[] }) {
    return this.streamingService.crearEncuesta(salaId, body)
  }

  @Get('salas/:salaId/encuestas')
  encuestasBySala(@Param('salaId', ParseIntPipe) salaId: number) {
    return this.streamingService.encuestasBySala(salaId)
  }

  @Post('encuestas/:encuestaId/votar')
  votar(@Param('encuestaId', ParseIntPipe) encuestaId: number, @Request() req: any, @Body('opcion_index') opcionIndex: number) {
    return this.streamingService.votar(encuestaId, req.user.id, opcionIndex)
  }

  @Get('encuestas/:encuestaId/resultados')
  resultados(@Param('encuestaId', ParseIntPipe) encuestaId: number) {
    return this.streamingService.resultadosEncuesta(encuestaId)
  }

  // --- Q&A ---
  @Post('salas/:salaId/preguntas')
  hacerPregunta(@Param('salaId', ParseIntPipe) salaId: number, @Request() req: any, @Body('pregunta') pregunta: string) {
    return this.streamingService.hacerPregunta(salaId, req.user.id, pregunta)
  }

  @Get('salas/:salaId/preguntas')
  preguntasBySala(@Param('salaId', ParseIntPipe) salaId: number) {
    return this.streamingService.preguntasBySala(salaId)
  }

  @Put('preguntas/:id/votar')
  votarPregunta(@Param('id', ParseIntPipe) id: number) {
    return this.streamingService.votarPregunta(id)
  }

  @Put('preguntas/:id/responder')
  @Roles(UserRole.ADMIN, UserRole.DOCENTE, UserRole.SPEAKER)
  responderPregunta(@Param('id', ParseIntPipe) id: number, @Body('respuesta') respuesta: string) {
    return this.streamingService.responderPregunta(id, respuesta)
  }
}
