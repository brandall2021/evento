import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { MatchNetworking, EstadoMatch } from './match.entity.js'
import { PerfilAsistente } from '../perfil/perfil.entity.js'

@Injectable()
export class NetworkingService {
  constructor(
    @InjectRepository(MatchNetworking)
    private readonly matchRepo: Repository<MatchNetworking>,
    @InjectRepository(PerfilAsistente)
    private readonly perfilRepo: Repository<PerfilAsistente>,
  ) {}

  async sugerirMatches(userId: number, cursoId: number) {
    const perfil = await this.perfilRepo.findOne({ where: { user_id: userId } })
    const intereses = perfil?.intereses?.split(',').map(i => i.trim().toLowerCase()) || []

    const perfiles = await this.perfilRepo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.user', 'u')
      .where('p.user_id != :userId', { userId })
      .getMany()

    const matches: any[] = []
    for (const p of perfiles) {
      const pIntereses = p.intereses?.split(',').map(i => i.trim().toLowerCase()) || []
      const coincidencias = intereses.filter(i => pIntereses.includes(i))
      if (coincidencias.length > 0) {
        const existente = await this.matchRepo.findOne({
          where: [
            { user_a_id: userId, user_b_id: p.user_id, curso_id: cursoId },
            { user_a_id: p.user_id, user_b_id: userId, curso_id: cursoId },
          ],
        })
        if (!existente) {
          matches.push({ user: p.user, perfil: p, coincidencias, puntuacion: coincidencias.length })
        }
      }
    }

    return matches.sort((a, b) => b.puntuacion - a.puntuacion)
  }

  async enviarSolicitud(userId: number, cursoId: number, targetUserId: number, mensaje?: string) {
    const existente = await this.matchRepo.findOne({
      where: [
        { user_a_id: userId, user_b_id: targetUserId, curso_id: cursoId },
        { user_a_id: targetUserId, user_b_id: userId, curso_id: cursoId },
      ],
    })
    if (existente) throw new BadRequestException('Ya existe un match con este usuario')

    const match = this.matchRepo.create({
      user_a_id: userId,
      user_b_id: targetUserId,
      curso_id: cursoId,
      mensaje: mensaje || null,
    })
    return this.matchRepo.save(match)
  }

  async responder(matchId: number, userId: number, aceptar: boolean) {
    const match = await this.matchRepo.findOneBy({ id: matchId })
    if (!match) throw new NotFoundException('Match no encontrado')
    if (match.user_b_id !== userId) throw new BadRequestException('No autorizado')

    match.estado = aceptar ? EstadoMatch.ACEPTADO : EstadoMatch.RECHAZADO
    return this.matchRepo.save(match)
  }

  async misMatches(userId: number, cursoId?: number) {
    const where: any = [
      { user_a_id: userId },
      { user_b_id: userId },
    ]
    if (cursoId) {
      where[0].curso_id = cursoId
      where[1].curso_id = cursoId
    }
    return this.matchRepo.find({
      where,
      relations: ['user_a', 'user_b', 'curso'],
      order: { createdAt: 'DESC' },
    })
  }
}
