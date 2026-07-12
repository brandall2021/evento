import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { SalaStreaming } from './sala-streaming.entity.js'
import { EncuestaStreaming } from './encuesta.entity.js'
import { RespuestaEncuesta } from './respuesta-encuesta.entity.js'
import { PreguntaQA } from './pregunta-qa.entity.js'
import { StreamingService } from './streaming.service.js'
import { StreamingController } from './streaming.controller.js'

@Module({
  imports: [TypeOrmModule.forFeature([SalaStreaming, EncuestaStreaming, RespuestaEncuesta, PreguntaQA])],
  controllers: [StreamingController],
  providers: [StreamingService],
  exports: [StreamingService],
})
export class StreamingModule {}
