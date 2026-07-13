import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { PuntosHistorial, FuentePuntos } from './puntos-historial.entity.js'
import { Badge } from './badge.entity.js'
import { UsuarioBadge } from './usuario-badge.entity.js'

@Injectable()
export class GamificacionService {
  constructor(
    @InjectRepository(PuntosHistorial)
    private readonly puntosRepo: Repository<PuntosHistorial>,
    @InjectRepository(Badge)
    private readonly badgeRepo: Repository<Badge>,
    @InjectRepository(UsuarioBadge)
    private readonly usuarioBadgeRepo: Repository<UsuarioBadge>,
  ) {}

  async agregarPuntos(userId: number, puntos: number, fuente: FuentePuntos, referenciaId?: number, descripcion?: string) {
    const registro = this.puntosRepo.create({
      user_id: userId,
      puntos,
      fuente,
      referencia_id: referenciaId || null,
      descripcion: descripcion || null,
    })
    await this.puntosRepo.save(registro)
    await this.verificarBadges(userId)
    return registro
  }

  async puntosTotales(userId: number): Promise<number> {
    const result = await this.puntosRepo
      .createQueryBuilder('p')
      .select('SUM(p.puntos)', 'total')
      .where('p.user_id = :userId', { userId })
      .getRawOne()
    return parseInt(result?.total || '0')
  }

  async historial(userId: number, page?: number, pageSize?: number) {
    if (page) {
      const [data, total] = await this.puntosRepo.findAndCount({
        where: { user_id: userId },
        order: { createdAt: 'DESC' },
        take: pageSize || 20,
        skip: (page - 1) * (pageSize || 20),
      })
      return { data, total, page, pageSize: pageSize || 20 }
    }
    return this.puntosRepo.find({
      where: { user_id: userId },
      order: { createdAt: 'DESC' },
    })
  }

  async ranking(cursoId?: number, limit?: number) {
    const qb = this.puntosRepo
      .createQueryBuilder('p')
      .select('p.user_id', 'user_id')
      .addSelect('SUM(p.puntos)', 'total_puntos')
      .groupBy('p.user_id')
      .orderBy('total_puntos', 'DESC')
      .limit(limit || 50)

    const results = await qb.getRawMany()
    return results.map((r, i) => ({
      posicion: i + 1,
      user_id: r.user_id,
      total_puntos: parseInt(r.total_puntos),
    }))
  }

  // --- Badges ---
  async crearBadge(data: { nombre: string; descripcion?: string; imagen_url?: string; icono?: string; puntos_requeridos?: number }) {
    const badge = this.badgeRepo.create(data)
    return this.badgeRepo.save(badge)
  }

  async badgesDisponibles() {
    return this.badgeRepo.find({ where: { activo: true } })
  }

  async misBadges(userId: number) {
    return this.usuarioBadgeRepo.find({
      where: { user_id: userId },
      relations: ['badge'],
      order: { otorgado_at: 'DESC' },
    })
  }

  async otorgarBadge(userId: number, badgeId: number, cursoId?: number) {
    const existente = await this.usuarioBadgeRepo.findOne({
      where: { user_id: userId, badge_id: badgeId, curso_id: cursoId || 0 },
    })
    if (existente) return existente

    const ub = this.usuarioBadgeRepo.create({
      user_id: userId,
      badge_id: badgeId,
      curso_id: cursoId || 0,
    })
    return this.usuarioBadgeRepo.save(ub)
  }

  private async verificarBadges(userId: number) {
    const total = await this.puntosTotales(userId)
    const badges = await this.badgeRepo.find({ where: { activo: true } })
    for (const badge of badges) {
      if (total >= badge.puntos_requeridos) {
        await this.otorgarBadge(userId, badge.id)
      }
    }
  }
}
