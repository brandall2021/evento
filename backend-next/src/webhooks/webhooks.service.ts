import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Webhook, WebhookEvent } from './webhook.entity.js'

@Injectable()
export class WebhooksService {
  constructor(
    @InjectRepository(Webhook) private webhookRepo: Repository<Webhook>,
    @InjectRepository(WebhookEvent) private eventRepo: Repository<WebhookEvent>,
  ) {}

  async crear(data: { url: string; eventos: string[]; user_id?: number; secret?: string }) {
    return this.webhookRepo.save(data)
  }

  async listar() {
    return this.webhookRepo.find({ order: { created_at: 'DESC' } })
  }

  async actualizar(id: number, data: Partial<Webhook>) {
    await this.webhookRepo.update(id, data)
    return this.webhookRepo.findOne({ where: { id } })
  }

  async eliminar(id: number) {
    await this.webhookRepo.delete(id)
  }

  async dispararEvento(evento: string, payload: any) {
    const hooks = await this.webhookRepo.find({ where: { activo: true } })
    const matching = hooks.filter(h => h.eventos.includes(evento) || h.eventos.includes('*'))

    const events: WebhookEvent[] = []
    for (const hook of matching) {
      events.push(await this.eventRepo.save({
        webhook_id: hook.id,
        evento,
        payload,
      }))
    }
    return events
  }

  async enviar(eventId: number) {
    const event = await this.eventRepo.findOne({ where: { id: eventId } })
    if (!event) return null

    const hook = await this.webhookRepo.findOne({ where: { id: event.webhook_id } })
    if (!hook) return null

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (hook.secret) {
        const crypto = await import('crypto')
        const sig = crypto.createHmac('sha256', hook.secret).update(JSON.stringify(event.payload)).digest('hex')
        headers['X-Webhook-Signature'] = sig
      }

      const res = await fetch(hook.url, {
        method: 'POST',
        headers,
        body: JSON.stringify({ evento: event.evento, payload: event.payload, timestamp: new Date().toISOString() }),
        signal: AbortSignal.timeout(10000),
      })

      event.estado = 'enviado'
      event.respuesta_status = res.status
      event.respuesta_body = await res.text().catch(() => '')
      event.enviado_at = new Date()
      event.completado_at = new Date()
      event.intentos += 1
    } catch (err) {
      event.intentos += 1
      event.estado = event.intentos >= 3 ? 'fallido' : 'reintentando'
      event.respuesta_body = err instanceof Error ? err.message : 'Error'
    }

    await this.eventRepo.save(event)
    return event
  }

  async eventos(webhookId?: number) {
    if (webhookId) return this.eventRepo.find({ where: { webhook_id: webhookId }, order: { created_at: 'DESC' }, take: 50 })
    return this.eventRepo.find({ order: { created_at: 'DESC' }, take: 50 })
  }
}
