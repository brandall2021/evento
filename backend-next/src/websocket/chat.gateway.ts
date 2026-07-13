import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { Logger, UseGuards } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'

@WebSocketGateway({ cors: { origin: '*' }, namespace: '/chat' })
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server
  private readonly logger = new Logger(ChatGateway.name)
  private readonly onlineUsers = new Map<number, string>()

  constructor(private readonly jwtService: JwtService) {}

  afterInit() {
    this.logger.log('WebSocket Chat Gateway initialized')
  }

  handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth?.token || client.handshake.query?.token
      if (!token) { client.disconnect(); return }
      const payload = this.jwtService.verify(token as string)
      const userId = payload.id
      client.data = { userId }
      this.onlineUsers.set(userId, client.id)
      this.server.emit('online_users', Array.from(this.onlineUsers.keys()))
      this.logger.log(`User ${userId} connected`)
    } catch {
      client.disconnect()
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.data?.userId
    if (userId) {
      this.onlineUsers.delete(userId)
      this.server.emit('online_users', Array.from(this.onlineUsers.keys()))
      this.logger.log(`User ${userId} disconnected`)
    }
  }

  @SubscribeMessage('join_conversation')
  handleJoin(@ConnectedSocket() client: Socket, @MessageBody() data: { conversationId: number }) {
    client.join(`conv:${data.conversationId}`)
  }

  @SubscribeMessage('leave_conversation')
  handleLeave(@ConnectedSocket() client: Socket, @MessageBody() data: { conversationId: number }) {
    client.leave(`conv:${data.conversationId}`)
  }

  @SubscribeMessage('send_message')
  handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: number; contenido: string; tipo?: string },
  ) {
    const userId = client.data?.userId
    if (!userId) return
    const message = {
      id: Date.now(),
      conversacion_id: data.conversationId,
      user_id: userId,
      contenido: data.contenido,
      tipo: data.tipo || 'texto',
      created_at: new Date().toISOString(),
    }
    this.server.to(`conv:${data.conversationId}`).emit('new_message', message)
    return message
  }

  @SubscribeMessage('typing')
  handleTyping(@ConnectedSocket() client: Socket, @MessageBody() data: { conversationId: number; isTyping: boolean }) {
    const userId = client.data?.userId
    if (!userId) return
    client.to(`conv:${data.conversationId}`).emit('user_typing', { userId, conversationId: data.conversationId, isTyping: data.isTyping })
  }

  @SubscribeMessage('mark_read')
  handleMarkRead(@ConnectedSocket() client: Socket, @MessageBody() data: { conversationId: number }) {
    const userId = client.data?.userId
    if (!userId) return
    client.to(`conv:${data.conversationId}`).emit('messages_read', { userId, conversationId: data.conversationId })
  }

  emitToUser(userId: number, event: string, data: any) {
    const socketId = this.onlineUsers.get(userId)
    if (socketId) this.server.to(socketId).emit(event, data)
  }

  emitToConversation(conversationId: number, event: string, data: any) {
    this.server.to(`conv:${conversationId}`).emit(event, data)
  }

  getOnlineUsers(): number[] {
    return Array.from(this.onlineUsers.keys())
  }
}
