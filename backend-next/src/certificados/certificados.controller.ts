import { Controller, Get, Post, Body, Param, Query, Res, Request, ParseIntPipe, UseGuards } from '@nestjs/common'
import { Response } from 'express'
import { CertificadosService } from './certificados.service.js'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js'
import { RolesGuard } from '../common/guards/roles.guard.js'
import { Roles } from '../common/decorators/roles.decorator.js'
import { UserRole } from '../users/user.entity.js'

@Controller('certificados')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CertificadosController {
  constructor(private readonly certificadosService: CertificadosService) {}

  @Get()
  findAll(
    @Request() req: any,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.certificadosService.findAll(req.user, {
      page: page ? parseInt(page) : undefined,
      pageSize: pageSize ? parseInt(pageSize) : undefined,
    })
  }

  @Post('emitir')
  @Roles(UserRole.ADMIN)
  emitir(@Body('inscripcion_id') inscripcionId: number, @Body('nota') nota?: number) {
    return this.certificadosService.emitir(inscripcionId, nota)
  }

  @Get('validar/:codigo')
  validar(@Param('codigo') codigo: string) {
    return this.certificadosService.validar(codigo)
  }

  @Get(':id/descargar')
  async descargar(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    const { stream, filename } = await this.certificadosService.descargar(id)
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`)
    stream.pipe(res)
  }
}
