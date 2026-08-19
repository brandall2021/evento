import { Controller, Get, Post, Body, Param, Res, Request, ParseIntPipe, UseGuards } from '@nestjs/common'
import { Response } from 'express'
import { CredencialesService } from './credenciales.service'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { RolesGuard } from '../common/guards/roles.guard'
import { Roles } from '../common/decorators/roles.decorator'
import { UserRole } from '../users/user.entity'

@Controller('credenciales')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CredencialesController {
  constructor(private readonly credencialesService: CredencialesService) {}

  @Post('emitir')
  @Roles(UserRole.ADMIN)
  emitir(@Body('inscripcion_id') inscripcionId: number) {
    return this.credencialesService.emitir(inscripcionId)
  }

  @Get(':id/descargar')
  async descargar(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    const { stream, filename } = await this.credencialesService.descargar(id)
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`)
    stream.pipe(res)
  }

  @Get('validar/:codigo')
  validar(@Param('codigo') codigo: string) {
    return this.credencialesService.validar(codigo)
  }

  @Get('mis')
  misCredenciales(@Request() req: any) {
    return this.credencialesService.misCredenciales(req.user.id)
  }
}
