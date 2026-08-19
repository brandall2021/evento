import { Module, OnModuleInit } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Conversacion } from './conversacion.entity'
import { MensajeChat } from './mensaje.entity'
import { ParticipanteConversacion } from './participante.entity'
import { ChatService } from './chat.service'
import { ChatController } from './chat.controller'
import { WebsocketModule } from '../websocket/websocket.module'
import { ChatGateway } from '../websocket/chat.gateway'

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
