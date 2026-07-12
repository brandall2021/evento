import { Controller, Get, Post, Put, Body, Param, Query, Request, ParseIntPipe, UseGuards } from '@nestjs/common'
import { NetworkingService } from './networking.service.js'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js'

@Controller('networking')
@UseGuards(JwtAuthGuard)
export class NetworkingController {
  constructor(private readonly networkingService: NetworkingService) {}

  @Get('sugerir/:cursoId')
  sugerir(@Param('cursoId', ParseIntPipe) cursoId: number, @Request() req: any) {
    return this.networkingService.sugerirMatches(req.user.id, cursoId)
  }

  @Post('solicitud')
  solicitar(
    @Request() req: any,
    @Body() body: { curso_id: number; target_user_id: number; mensaje?: string },
  ) {
    return this.networkingService.enviarSolicitud(req.user.id, body.curso_id, body.target_user_id, body.mensaje)
  }

  @Put(':id/responder')
  responder(@Param('id', ParseIntPipe) id: number, @Request() req: any, @Body('aceptar') aceptar: boolean) {
    return this.networkingService.responder(id, req.user.id, aceptar)
  }

  @Get('mis')
  misMatches(@Request() req: any, @Query('curso_id') cursoId?: string) {
    return this.networkingService.misMatches(req.user.id, cursoId ? parseInt(cursoId) : undefined)
  }
}
