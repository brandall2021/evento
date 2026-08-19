import { Controller, Get, Put, Body, Param, Query, Request, ParseIntPipe, UseGuards } from '@nestjs/common'
import { PerfilService } from './perfil.service'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { RolesGuard } from '../common/guards/roles.guard'
import { Roles } from '../common/decorators/roles.decorator'
import { UserRole } from '../users/user.entity'

@Controller('perfil')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PerfilController {
  constructor(private readonly perfilService: PerfilService) {}

  @Get()
  miPerfil(@Request() req: any) {
    return this.perfilService.findOrCreate(req.user.id)
  }

  @Put()
  actualizar(@Request() req: any, @Body() body: {
    empresa?: string
    cargo?: string
    bio?: string
    intereses?: string
    redes_sociales?: Record<string, string>
  }) {
    return this.perfilService.update(req.user.id, body)
  }

  @Get(':userId')
  publico(@Param('userId', ParseIntPipe) userId: number) {
    return this.perfilService.findByUserId(userId)
  }

  @Get('admin/todos')
  @Roles(UserRole.ADMIN)
  todos(@Query('page') page?: string, @Query('pageSize') pageSize?: string) {
    return this.perfilService.findAll(
      page ? parseInt(page) : undefined,
      pageSize ? parseInt(pageSize) : undefined,
    )
  }
}
