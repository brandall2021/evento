import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Comentario } from './comentario.entity.js'
import { Like } from './like.entity.js'
import { Trivia } from './trivia.entity.js'
import { RespuestaTrivia } from './respuesta-trivia.entity.js'
import { InteraccionService } from './interaccion.service.js'
import { InteraccionController } from './interaccion.controller.js'

@Module({
  imports: [TypeOrmModule.forFeature([Comentario, Like, Trivia, RespuestaTrivia])],
  controllers: [InteraccionController],
  providers: [InteraccionService],
  exports: [InteraccionService],
})
export class InteraccionModule {}
