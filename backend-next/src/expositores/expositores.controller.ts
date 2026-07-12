import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common'
import { ExpositoresService } from './expositores.service.js'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js'
import { RolesGuard } from '../common/guards/roles.guard.js'
import { Roles } from '../common/decorators/roles.decorator.js'
import { UserRole } from '../users/user.entity.js'

@Controller('cursos/:cursoId/expositores')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ExpositoresController {
  constructor(private readonly expositoresService: ExpositoresService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.COORDINATOR)
  crear(
    @Param('cursoId', ParseIntPipe) cursoId: number,
    @Body() body: {
      user_id: number; nombre_empresa: string; descripcion?: string;
      logo_url?: string; stand_numero?: string; stand_ubicacion?: string
    },
  ) {
    return this.expositoresService.crear({ ...body, curso_id: cursoId })
  }

  @Get()
  findByCurso(@Param('cursoId', ParseIntPipe) cursoId: number) {
    return this.expositoresService.findByCurso(cursoId)
  }
}

@Controller('expositores')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ExpositorController {
  constructor(private readonly expositoresService: ExpositoresService) {}

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.expositoresService.findById(id)
  }

  @Put(':id')
  @Roles(UserRole.ADMIN, UserRole.COORDINATOR)
  actualizar(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.expositoresService.actualizar(id, body)
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.expositoresService.eliminar(id)
  }

  @Post(':expositorId/productos')
  @Roles(UserRole.ADMIN, UserRole.COORDINATOR, UserRole.EXHIBITOR)
  crearProducto(
    @Param('expositorId', ParseIntPipe) expositorId: number,
    @Body() body: { nombre: string; descripcion?: string; imagen_url?: string; precio?: number; url_externa?: string },
  ) {
    return this.expositoresService.crearProducto(expositorId, body)
  }

  @Get(':expositorId/productos')
  productosByExpositor(@Param('expositorId', ParseIntPipe) expositorId: number) {
    return this.expositoresService.productosByExpositor(expositorId)
  }

  @Put('productos/:id')
  @Roles(UserRole.ADMIN, UserRole.COORDINATOR, UserRole.EXHIBITOR)
  actualizarProducto(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.expositoresService.actualizarProducto(id, body)
  }

  @Delete('productos/:id')
  @Roles(UserRole.ADMIN, UserRole.COORDINATOR)
  eliminarProducto(@Param('id', ParseIntPipe) id: number) {
    return this.expositoresService.eliminarProducto(id)
  }
}
