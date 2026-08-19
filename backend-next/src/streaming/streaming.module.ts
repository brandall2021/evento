import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { SalaStreaming } from './sala-streaming.entity'
import { EncuestaStreaming } from './encuesta.entity'
import { RespuestaEncuesta } from './respuesta-encuesta.entity'
import { PreguntaQA } from './pregunta-qa.entity'
import { StreamingService } from './streaming.service'
import { StreamingController } from './streaming.controller'

@Module({
  imports: [TypeOrmModule.forFeature([SalaStreaming, EncuestaStreaming, RespuestaEncuesta, PreguntaQA])],
  controllers: [StreamingController],
  providers: [StreamingService],
  exports: [StreamingService],
})
export class StreamingModule {}
