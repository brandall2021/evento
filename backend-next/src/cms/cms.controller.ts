import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common'
import { CmsService } from './cms.service.js'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js'
import { RolesGuard } from '../common/guards/roles.guard.js'
import { Roles } from '../common/decorators/roles.decorator.js'
import { UserRole } from '../users/user.entity.js'

@Controller('cms')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class CmsController {
  constructor(private readonly cmsService: CmsService) {}

  @Post('paginas')
  crearPagina(@Body() body: {
    slug: string; titulo: string; contenido?: string; tipo?: string;
    meta_title?: string; meta_description?: string; publica?: boolean; orden?: number
  }) {
    return this.cmsService.crearPagina(body)
  }

  @Get('paginas')
  paginas() {
    return this.cmsService.paginas()
  }

  @Put('paginas/:id')
  actualizarPagina(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.cmsService.actualizarPagina(id, body)
  }

  @Delete('paginas/:id')
  eliminarPagina(@Param('id', ParseIntPipe) id: number) {
    return this.cmsService.eliminarPagina(id)
  }

  @Post('blog')
  crearPost(@Body() body: {
    titulo: string; slug: string; resumen?: string; contenido: string;
    imagen_portada?: string; autor_id?: number; meta_title?: string; meta_description?: string
  }) {
    return this.cmsService.crearPost(body)
  }

  @Get('blog')
  posts() {
    return this.cmsService.posts()
  }

  @Put('blog/:id')
  actualizarPost(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.cmsService.actualizarPost(id, body)
  }

  @Delete('blog/:id')
  eliminarPost(@Param('id', ParseIntPipe) id: number) {
    return this.cmsService.eliminarPost(id)
  }

  @Post('galeria')
  agregarMedia(@Body() body: {
    curso_id?: number; titulo: string; descripcion?: string;
    url: string; thumbnail_url?: string; tipo?: string; orden?: number
  }) {
    return this.cmsService.agregarMedia(body)
  }

  @Get('galeria/curso/:cursoId')
  galeriaByCurso(@Param('cursoId', ParseIntPipe) cursoId: number) {
    return this.cmsService.galeriaByCurso(cursoId)
  }

  @Delete('galeria/:id')
  eliminarMedia(@Param('id', ParseIntPipe) id: number) {
    return this.cmsService.eliminarMedia(id)
  }

  @Post('faqs')
  crearFAQ(@Body() body: { curso_id?: number; pregunta: string; respuesta: string; orden?: number }) {
    return this.cmsService.crearFAQ(body)
  }

  @Put('faqs/:id')
  actualizarFAQ(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.cmsService.actualizarFAQ(id, body)
  }

  @Delete('faqs/:id')
  eliminarFAQ(@Param('id', ParseIntPipe) id: number) {
    return this.cmsService.eliminarFAQ(id)
  }
}
