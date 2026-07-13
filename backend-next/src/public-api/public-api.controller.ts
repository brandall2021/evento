import { Controller, Get, Param, Query, ParseIntPipe } from '@nestjs/common'
import { PublicApiService } from './public-api.service.js'

@Controller('public')
export class PublicApiController {
  constructor(private readonly publicApiService: PublicApiService) {}

  @Get('cursos')
  cursos(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.publicApiService.cursos(page ? parseInt(page) : undefined, limit ? parseInt(limit) : undefined)
  }

  @Get('cursos/:id')
  cursoById(@Param('id', ParseIntPipe) id: number) {
    return this.publicApiService.cursoById(id)
  }

  @Get('blog')
  blog(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.publicApiService.blogPosts(page ? parseInt(page) : undefined, limit ? parseInt(limit) : undefined)
  }

  @Get('blog/:slug')
  blogPostBySlug(@Param('slug') slug: string) {
    return this.publicApiService.blogPostBySlug(slug)
  }

  @Get('faq/curso/:cursoId')
  faqsByCurso(@Param('cursoId', ParseIntPipe) cursoId: number) {
    return this.publicApiService.faqsByCurso(cursoId)
  }

  @Get('faq/globales')
  faqsGlobales() {
    return this.publicApiService.faqsGlobales()
  }

  @Get('galeria/curso/:cursoId')
  galeriaByCurso(@Param('cursoId', ParseIntPipe) cursoId: number) {
    return this.publicApiService.galeriaByCurso(cursoId)
  }

  @Get('ponentes')
  ponentes() {
    return this.publicApiService.ponentes()
  }

  @Get('ponentes/:id')
  ponenteById(@Param('id', ParseIntPipe) id: number) {
    return this.publicApiService.ponenteById(id)
  }

  @Get('certificados/validar/:codigo')
  validarCodigo(@Param('codigo') codigo: string) {
    return this.publicApiService.validarCodigo(codigo)
  }

  @Get('plantilla-certificado')
  plantillaDefault() {
    return this.publicApiService.plantillaDefault()
  }
}
