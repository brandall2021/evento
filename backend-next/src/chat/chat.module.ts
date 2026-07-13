import { Module, OnModuleInit } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Conversacion } from './conversacion.entity.js'
import { MensajeChat } from './mensaje.entity.js'
import { ParticipanteConversacion } from './participante.entity.js'
import { ChatService } from './chat.service.js'
import { ChatController } from './chat.controller.js'
import { WebsocketModule } from '../websocket/websocket.module.js'
import { ChatGateway } from '../websocket/chat.gateway.js'

@Module({
  imports: [
    TypeOrmModule.forFeature([Conversacion, MensajeChat, ParticipanteConversacion]),
    WebsocketModule,
  ],
  controllers: [ChatController],
  providers: [ChatService],
  exports: [ChatService],
})
export class ChatModule implements OnModuleInit {
  constructor(
    private readonly chatService: ChatService,
    private readonly chatGateway: ChatGateway,
  ) {}

  onModuleInit() {
    this.chatService.setGateway(this.chatGateway)
  }
}
