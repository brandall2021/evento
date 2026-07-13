import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Curso } from '../cursos/curso.entity.js'
import { BlogPost } from '../cms/blog-post.entity.js'
import { FAQ } from '../cms/faq.entity.js'
import { Galeria } from '../cms/galeria.entity.js'
import { PerfilPonente } from '../ponentes/perfil-ponente.entity.js'
import { PlantillaCertificado } from '../plantillas/plantilla.entity.js'
import { PublicApiService } from './public-api.service.js'
import { PublicApiController } from './public-api.controller.js'

@Module({
  imports: [TypeOrmModule.forFeature([Curso, BlogPost, FAQ, Galeria, PerfilPonente, PlantillaCertificado])],
  controllers: [PublicApiController],
  providers: [PublicApiService],
  exports: [PublicApiService],
})
export class PublicApiModule {}
