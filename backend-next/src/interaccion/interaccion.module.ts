import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Comentario } from './comentario.entity'
import { Like } from './like.entity'
import { Trivia } from './trivia.entity'
import { RespuestaTrivia } from './respuesta-trivia.entity'
import { InteraccionService } from './interaccion.service'
import { InteraccionController } from './interaccion.controller'

@Module({
  imports: [TypeOrmModule.forFeature([Comentario, Like, Trivia, RespuestaTrivia])],
  controllers: [InteraccionController],
  providers: [InteraccionService],
  exports: [InteraccionService],
})
export class InteraccionModule {}
