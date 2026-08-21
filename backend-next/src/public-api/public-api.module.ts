import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Curso } from '../cursos/curso.entity'
import { BlogPost } from '../cms/blog-post.entity'
import { FAQ } from '../cms/faq.entity'
import { Galeria } from '../cms/galeria.entity'
import { PerfilPonente } from '../ponentes/perfil-ponente.entity'
import { PlantillaCertificado } from '../plantillas/plantilla.entity'
import { FormsModule } from '../forms/forms.module'
import { Inscripcion } from '../inscripciones/inscripcion.entity'
import { PublicApiService } from './public-api.service'
import { PublicApiController } from './public-api.controller'

@Module({
  imports: [TypeOrmModule.forFeature([Curso, BlogPost, FAQ, Galeria, PerfilPonente, PlantillaCertificado, Inscripcion]), FormsModule],
  controllers: [PublicApiController],
  providers: [PublicApiService],
  exports: [PublicApiService],
})
export class PublicApiModule {}
