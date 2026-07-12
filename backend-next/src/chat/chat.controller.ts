import { Controller, Get, Post, Put, Body, Param, Query, Request, ParseIntPipe, UseGuards } from '@nestjs/common'
import { ChatService } from './chat.service.js'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js'

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('conversaciones')
  crear(@Request() req: any, @Body() body: { nombre?: string; curso_id?: number; participantes: number[] }) {
    return this.chatService.crearConversacion(req.user.id, body)
  }

  @Get('conversaciones')
  misConversaciones(@Request() req: any) {
    return this.chatService.misConversaciones(req.user.id)
  }

  @Post('conversaciones/:id/mensajes')
  enviarMensaje(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
    @Body() body: { contenido: string; tipo?: string },
  ) {
    return this.chatService.enviarMensaje(id, req.user.id, body.contenido, body.tipo)
  }

  @Get('conversaciones/:id/mensajes')
  mensajes(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.chatService.mensajes(id, req.user.id, page ? parseInt(page) : undefined, pageSize ? parseInt(pageSize) : undefined)
  }

  @Put('conversaciones/:id/leido')
  marcarLeido(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.chatService.marcarLeido(id, req.user.id)
  }

  @Get('conversaciones/:id/participantes')
  participantes(@Param('id', ParseIntPipe) id: number) {
    return this.chatService.participantes(id)
  }
}
