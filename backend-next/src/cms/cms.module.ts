import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Pagina } from './pagina.entity.js'
import { BlogPost } from './blog-post.entity.js'
import { Galeria } from './galeria.entity.js'
import { FAQ } from './faq.entity.js'
import { CmsService } from './cms.service.js'
import { CmsController } from './cms.controller.js'

@Module({
  imports: [TypeOrmModule.forFeature([Pagina, BlogPost, Galeria, FAQ])],
  controllers: [CmsController],
  providers: [CmsService],
  exports: [CmsService],
})
export class CmsModule {}
