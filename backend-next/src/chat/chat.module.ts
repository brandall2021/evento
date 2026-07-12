import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Conversacion } from './conversacion.entity.js'
import { MensajeChat } from './mensaje.entity.js'
import { ParticipanteConversacion } from './participante.entity.js'
import { ChatService } from './chat.service.js'
import { ChatController } from './chat.controller.js'

@Module({
  imports: [TypeOrmModule.forFeature([Conversacion, MensajeChat, ParticipanteConversacion])],
  controllers: [ChatController],
  providers: [ChatService],
  exports: [ChatService],
})
export class ChatModule {}
