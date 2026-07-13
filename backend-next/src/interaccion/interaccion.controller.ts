import { Controller, Get, Post, Put, Delete, Body, Param, Query, Request, ParseIntPipe, UseGuards } from '@nestjs/common'
import { InteraccionService } from './interaccion.service.js'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js'

@Controller('interaccion')
@UseGuards(JwtAuthGuard)
export class InteraccionController {
  constructor(private readonly interaccionService: InteraccionService) {}

  // --- Comentarios ---
  @Post('comentarios')
  crearComentario(@Request() req: any, @Body() body: {
    curso_id?: number; sesion_id?: number; contenido: string; padre_id?: number
  }) {
    return this.interaccionService.crearComentario(req.user.id, body)
  }

  @Get('comentarios/curso/:cursoId')
  comentariosByCurso(
    @Param('cursoId', ParseIntPipe) cursoId: number,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.interaccionService.comentariosByCurso(cursoId, page ? parseInt(page) : undefined, pageSize ? parseInt(pageSize) : undefined)
  }

  @Get('comentarios/sesion/:sesionId')
  comentariosBySesion(@Param('sesionId', ParseIntPipe) sesionId: number) {
    return this.interaccionService.comentariosBySesion(sesionId)
  }

  @Get('comentarios/:id/respuestas')
  respuestas(@Param('id', ParseIntPipe) id: number) {
    return this.interaccionService.respuestas(id)
  }

  @Delete('comentarios/:id')
  eliminarComentario(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.interaccionService.eliminarComentario(id, req.user.id)
  }

  // --- Likes ---
  @Post('comentarios/:comentarioId/like')
  toggleLike(@Param('comentarioId', ParseIntPipe) comentarioId: number, @Request() req: any) {
    return this.interaccionService.toggleLike(req.user.id, comentarioId)
  }

  @Get('comentarios/:comentarioId/likes')
  likesByComentario(@Param('comentarioId', ParseIntPipe) comentarioId: number) {
    return this.interaccionService.likesByComentario(comentarioId)
  }

  // --- Trivia ---
  @Post('trivias/curso/:cursoId')
  crearTrivia(
    @Param('cursoId', ParseIntPipe) cursoId: number,
    @Body() body: { titulo: string; descripcion?: string; puntos_por_pregunta?: number },
  ) {
    return this.interaccionService.crearTrivia(cursoId, body)
  }

  @Get('trivias/curso/:cursoId')
  triviasByCurso(@Param('cursoId', ParseIntPipe) cursoId: number) {
    return this.interaccionService.triviasByCurso(cursoId)
  }

  @Post('trivias/:id/submit')
  submitTrivia(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
    @Body() body: { respuestas: number[]; respuestas_correctas: number[] },
  ) {
    return this.interaccionService.submitTrivia(id, req.user.id, body.respuestas, body.respuestas_correctas)
  }

  @Get('trivias/:id/resultados')
  resultadosTrivia(@Param('id', ParseIntPipe) id: number) {
    return this.interaccionService.resultadosTrivia(id)
  }
}
