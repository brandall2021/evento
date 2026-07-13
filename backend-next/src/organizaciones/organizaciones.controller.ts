import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, UseGuards, Req } from '@nestjs/common'
import { OrganizacionesService } from './organizaciones.service.js'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js'
import { RolesGuard } from '../common/guards/roles.guard.js'
import { Roles } from '../common/decorators/roles.decorator.js'
import { UserRole } from '../users/user.entity.js'

@Controller('organizaciones')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrganizacionesController {
  constructor(private readonly organizacionesService: OrganizacionesService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  crear(@Body() body: { nombre: string; slug?: string; descripcion?: string; plan?: string }) {
    return this.organizacionesService.crear(body)
  }

  @Get()
  findAll() {
    return this.organizacionesService.findAll()
  }

  @Get('mis')
  mis(@Req() req: any) {
    return this.organizacionesService.misOrganizaciones(req.user.id)
  }

  @Get(':id')
  findById(@Param('id', ParseIntPipe) id: number) {
    return this.organizacionesService.findById(id)
  }

  @Put(':id')
  @Roles(UserRole.ADMIN)
  actualizar(@Param('id', ParseIntPipe) id: number, @Body() body: Partial<{ nombre: string; slug: string; plan: string; activa: boolean }>) {
    return this.organizacionesService.actualizar(id, body)
  }

  @Post(':id/miembros')
  @Roles(UserRole.ADMIN)
  agregarMiembro(@Param('id', ParseIntPipe) id: number, @Body() body: { user_id: number; rol?: string }) {
    return this.organizacionesService.agregarMiembro(id, body.user_id, body.rol)
  }

  @Delete(':id/miembros/:userId')
  @Roles(UserRole.ADMIN)
  removerMiembro(@Param('id', ParseIntPipe) id: number, @Param('userId', ParseIntPipe) userId: number) {
    return this.organizacionesService.removerMiembro(id, userId)
  }

  @Get(':id/miembros')
  miembros(@Param('id', ParseIntPipe) id: number) {
    return this.organizacionesService.miembros(id)
  }
}
