import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Notificacion, CanalNotificacion, EstadoNotificacion } from './notificacion.entity.js'
import { PlantillaNotificacion } from './plantilla-notificacion.entity.js'

@Injectable()
export class NotificacionesService {
  constructor(
    @InjectRepository(Notificacion)
    private readonly notifRepo: Repository<Notificacion>,
    @InjectRepository(PlantillaNotificacion)
    private readonly plantillaRepo: Repository<PlantillaNotificacion>,
  ) {}

  async enviar(userId: number, data: {
    titulo: string; contenido: string; canal?: string;
    referencia_tipo?: string; referencia_id?: number; metadata?: Record<string, any>
  }) {
    const notif = this.notifRepo.create({
      user_id: userId,
      titulo: data.titulo,
      contenido: data.contenido,
      canal: (data.canal as CanalNotificacion) || CanalNotificacion.IN_APP,
      referencia_tipo: data.referencia_tipo || null,
      referencia_id: data.referencia_id || null,
      metadata: data.metadata || null,
      estado: EstadoNotificacion.PENDIENTE,
    })
    return this.notifRepo.save(notif)
  }

  async enviarMasiva(userIds: number[], data: {
    titulo: string; contenido: string; canal?: string;
    referencia_tipo?: string; referencia_id?: number
  }) {
    const notifs = userIds.map(uid => this.notifRepo.create({
      user_id: uid,
      titulo: data.titulo,
      contenido: data.contenido,
      canal: (data.canal as CanalNotificacion) || CanalNotificacion.IN_APP,
      referencia_tipo: data.referencia_tipo || null,
      referencia_id: data.referencia_id || null,
      estado: EstadoNotificacion.PENDIENTE,
    }))
    return this.notifRepo.save(notifs)
  }

  async misNotificaciones(userId: number, page?: number, pageSize?: number) {
    if (page) {
      const [data, total] = await this.notifRepo.findAndCount({
        where: { user_id: userId },
        order: { createdAt: 'DESC' },
        take: pageSize || 20,
        skip: (page - 1) * (pageSize || 20),
      })
      const noLeidas = await this.notifRepo.count({
        where: { user_id: userId, estado: EstadoNotificacion.PENDIENTE },
      })
      return { data, total, no_leidas: noLeidas, page, pageSize: pageSize || 20 }
    }
    return this.notifRepo.find({
      where: { user_id: userId },
      order: { createdAt: 'DESC' },
    })
  }

  async marcarLeida(id: number, userId: number) {
    const notif = await this.notifRepo.findOneBy({ id, user_id: userId })
    if (!notif) throw new NotFoundException('Notificación no encontrada')
    notif.estado = EstadoNotificacion.LEIDA
    notif.leida_at = new Date()
    return this.notifRepo.save(notif)
  }

  async marcarTodasLeidas(userId: number) {
    await this.notifRepo.update(
      { user_id: userId, estado: EstadoNotificacion.PENDIENTE },
      { estado: EstadoNotificacion.LEIDA, leida_at: new Date() },
    )
    return { mensaje: 'Todas marcadas como leídas' }
  }

  async noLeidas(userId: number): Promise<number> {
    return this.notifRepo.count({
      where: { user_id: userId, estado: EstadoNotificacion.PENDIENTE },
    })
  }

  // --- Plantillas ---
  async crearPlantilla(data: {
    nombre: string; canal: string; asunto: string; cuerpo: string; variables?: string[]
  }) {
    const p = this.plantillaRepo.create({ ...data, canal: data.canal as CanalNotificacion })
    return this.plantillaRepo.save(p)
  }

  async plantillas() {
    return this.plantillaRepo.find({ order: { createdAt: 'DESC' } })
  }

  async usarPlantilla(plantillaId: number, userId: number, variables: Record<string, string>) {
    const plantilla = await this.plantillaRepo.findOneBy({ id: plantillaId })
    if (!plantilla) throw new NotFoundException('Plantilla no encontrada')

    let asunto = plantilla.asunto
    let cuerpo = plantilla.cuerpo
    for (const [key, value] of Object.entries(variables)) {
      asunto = asunto.replace(new RegExp(`{{${key}}}`, 'g'), value)
      cuerpo = cuerpo.replace(new RegExp(`{{${key}}}`, 'g'), value)
    }

    return this.enviar(userId, {
      titulo: asunto,
      contenido: cuerpo,
      canal: plantilla.canal,
    })
  }
}
