import { Injectable, NotFoundException, BadRequestException, Optional } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Conversacion } from './conversacion.entity.js'
import { MensajeChat, TipoMensaje } from './mensaje.entity.js'
import { ParticipanteConversacion } from './participante.entity.js'

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Conversacion)
    private readonly convRepo: Repository<Conversacion>,
    @InjectRepository(MensajeChat)
    private readonly msgRepo: Repository<MensajeChat>,
    @InjectRepository(ParticipanteConversacion)
    private readonly partRepo: Repository<ParticipanteConversacion>,
  ) {}

  private chatGateway: any = null

  setGateway(gateway: any) {
    this.chatGateway = gateway
  }

  async crearConversacion(userId: number, data: { nombre?: string; curso_id?: number; participantes: number[] }) {
    const conv = this.convRepo.create({
      nombre: data.nombre || null,
      es_grupal: data.participantes.length > 1,
      curso_id: data.curso_id || null,
    })
    await this.convRepo.save(conv)

    const todos = [...new Set([userId, ...data.participantes])]
    const parts = todos.map(uid => this.partRepo.create({ conversacion_id: conv.id, user_id: uid }))
    await this.partRepo.save(parts)

    return conv
  }

  async misConversaciones(userId: number) {
    const parts = await this.partRepo.find({ where: { user_id: userId } })
    const convIds = parts.map(p => p.conversacion_id)
    if (convIds.length === 0) return []
    return this.convRepo.findByIds(convIds)
  }

  async enviarMensaje(conversacionId: number, userId: number, contenido: string, tipo?: string) {
    const part = await this.partRepo.findOne({ where: { conversacion_id: conversacionId, user_id: userId } })
    if (!part) throw new BadRequestException('No eres participante de esta conversación')

    const msg = this.msgRepo.create({
      conversacion_id: conversacionId,
      remitente_id: userId,
      contenido,
      tipo: (tipo as TipoMensaje) || TipoMensaje.TEXTO,
    })
    const saved = await this.msgRepo.save(msg)

    if (this.chatGateway) {
      this.chatGateway.emitToConversation(conversacionId, 'new_message', saved)
    }

    return saved
  }

  async mensajes(conversacionId: number, userId: number, page?: number, pageSize?: number) {
    const part = await this.partRepo.findOne({ where: { conversacion_id: conversacionId, user_id: userId } })
    if (!part) throw new BadRequestException('No eres participante de esta conversación')

    if (page) {
      const [data, total] = await this.msgRepo.findAndCount({
        where: { conversacion_id: conversacionId },
        relations: ['remitente'],
        order: { createdAt: 'DESC' },
        take: pageSize || 50,
        skip: (page - 1) * (pageSize || 50),
      })
      return { data, total, page, pageSize: pageSize || 50 }
    }

    return this.msgRepo.find({
      where: { conversacion_id: conversacionId },
      relations: ['remitente'],
      order: { createdAt: 'ASC' },
    })
  }

  async marcarLeido(conversacionId: number, userId: number) {
    await this.partRepo.update(
      { conversacion_id: conversacionId, user_id: userId },
      { ultimo_leido_at: new Date() },
    )
    return { mensaje: 'Marcado como leído' }
  }

  async participantes(conversacionId: number) {
    return this.partRepo.find({
      where: { conversacion_id: conversacionId },
      relations: ['user'],
    })
  }
}
