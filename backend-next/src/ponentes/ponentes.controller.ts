import { Controller, Get, Put, Delete, Body, Param, Query, Request, ParseIntPipe, UseGuards } from '@nestjs/common'
import { PonentesService } from './ponentes.service.js'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js'
import { RolesGuard } from '../common/guards/roles.guard.js'
import { Roles } from '../common/decorators/roles.decorator.js'
import { UserRole } from '../users/user.entity.js'

@Controller('ponentes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PonentesController {
  constructor(private readonly ponentesService: PonentesService) {}

  @Get('mi-perfil')
  miPerfil(@Request() req: any) {
    return this.ponentesService.findOrCreate(req.user.id)
  }

  @Put('mi-perfil')
  @Roles(UserRole.SPEAKER, UserRole.ADMIN)
  actualizarMiPerfil(@Request() req: any, @Body() body: {
    cv_url?: string
    especialidad?: string
    bio_corta?: string
    calificacion?: number
    anos_experiencia?: number
  }) {
    return this.ponentesService.update(req.user.id, body)
  }

  @Get()
  findAll(@Query('page') page?: string, @Query('pageSize') pageSize?: string) {
    return this.ponentesService.findAll(
      page ? parseInt(page) : undefined,
      pageSize ? parseInt(pageSize) : undefined,
    )
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.ponentesService.findById(id)
  }

  @Get('usuario/:userId')
  findByUser(@Param('userId', ParseIntPipe) userId: number) {
    return this.ponentesService.findByUserId(userId)
  }

  @Delete('mi-perfil')
  @Roles(UserRole.SPEAKER, UserRole.ADMIN)
  eliminar(@Request() req: any) {
    return this.ponentesService.remove(req.user.id)
  }
}
