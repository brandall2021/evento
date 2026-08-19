import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Pagina } from './pagina.entity'
import { BlogPost } from './blog-post.entity'
import { Galeria } from './galeria.entity'
import { FAQ } from './faq.entity'
import { CmsService } from './cms.service'
import { CmsController } from './cms.controller'

@Module({
  imports: [TypeOrmModule.forFeature([Pagina, BlogPost, Galeria, FAQ])],
  controllers: [CmsController],
  providers: [CmsService],
  exports: [CmsService],
})
export class CmsModule {}
