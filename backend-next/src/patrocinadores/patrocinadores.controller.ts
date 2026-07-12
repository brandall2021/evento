import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common'
import { PatrocinadoresService } from './patrocinadores.service.js'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js'
import { RolesGuard } from '../common/guards/roles.guard.js'
import { Roles } from '../common/decorators/roles.decorator.js'
import { UserRole } from '../users/user.entity.js'

@Controller('cursos/:cursoId/patrocinadores')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PatrocinadoresController {
  constructor(private readonly patrocinadoresService: PatrocinadoresService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.COORDINATOR)
  crear(
    @Param('cursoId', ParseIntPipe) cursoId: number,
    @Body() body: {
      user_id: number; empresa: string; categoria?: string; logo_url?: string;
      monto?: number; contacto_nombre?: string; contacto_email?: string
    },
  ) {
    return this.patrocinadoresService.crear({ ...body, curso_id: cursoId })
  }

  @Get()
  findByCurso(@Param('cursoId', ParseIntPipe) cursoId: number) {
    return this.patrocinadoresService.findByCurso(cursoId)
  }

  @Get('beneficios')
  beneficiosByCurso(@Param('cursoId', ParseIntPipe) cursoId: number) {
    return this.patrocinadoresService.beneficiosByCurso(cursoId)
  }
}

@Controller('patrocinadores')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PatrocinadorController {
  constructor(private readonly patrocinadoresService: PatrocinadoresService) {}

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.patrocinadoresService.findById(id)
  }

  @Put(':id')
  @Roles(UserRole.ADMIN, UserRole.COORDINATOR)
  actualizar(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.patrocinadoresService.actualizar(id, body)
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.patrocinadoresService.eliminar(id)
  }

  @Post(':patrocinadorId/beneficios')
  @Roles(UserRole.ADMIN, UserRole.COORDINATOR)
  crearBeneficio(
    @Param('patrocinadorId', ParseIntPipe) patrocinadorId: number,
    @Body() body: {
      tipo: string; titulo: string; contenido?: string; imagen_url?: string;
      url?: string; activo?: boolean; orden?: number
    },
  ) {
    return this.patrocinadoresService.crearBeneficio(patrocinadorId, body)
  }

  @Get(':patrocinadorId/beneficios')
  beneficiosByPatrocinador(@Param('patrocinadorId', ParseIntPipe) patrocinadorId: number) {
    return this.patrocinadoresService.beneficiosByPatrocinador(patrocinadorId)
  }

  @Put('beneficios/:id')
  @Roles(UserRole.ADMIN, UserRole.COORDINATOR)
  actualizarBeneficio(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.patrocinadoresService.actualizarBeneficio(id, body)
  }

  @Delete('beneficios/:id')
  @Roles(UserRole.ADMIN)
  eliminarBeneficio(@Param('id', ParseIntPipe) id: number) {
    return this.patrocinadoresService.eliminarBeneficio(id)
  }
}
