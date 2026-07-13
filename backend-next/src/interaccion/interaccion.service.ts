import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, IsNull } from 'typeorm'
import { Comentario } from './comentario.entity.js'
import { Like } from './like.entity.js'
import { Trivia } from './trivia.entity.js'
import { RespuestaTrivia } from './respuesta-trivia.entity.js'

@Injectable()
export class InteraccionService {
  constructor(
    @InjectRepository(Comentario)
    private readonly comentarioRepo: Repository<Comentario>,
    @InjectRepository(Like)
    private readonly likeRepo: Repository<Like>,
    @InjectRepository(Trivia)
    private readonly triviaRepo: Repository<Trivia>,
    @InjectRepository(RespuestaTrivia)
    private readonly respuestaRepo: Repository<RespuestaTrivia>,
  ) {}

  // --- Comentarios ---
  async crearComentario(userId: number, data: {
    curso_id?: number; sesion_id?: number; contenido: string; padre_id?: number
  }) {
    const comentario = this.comentarioRepo.create({
      user_id: userId,
      curso_id: data.curso_id || null,
      sesion_id: data.sesion_id || null,
      contenido: data.contenido,
      padre_id: data.padre_id || null,
    })
    return this.comentarioRepo.save(comentario)
  }

  async comentariosByCurso(cursoId: number, page?: number, pageSize?: number) {
    const where: any = { curso_id: cursoId, padre_id: null }
    if (page) {
      const [data, total] = await this.comentarioRepo.findAndCount({
        where,
        relations: ['user'],
        order: { createdAt: 'DESC' },
        take: pageSize || 20,
        skip: (page - 1) * (pageSize || 20),
      })
      return { data, total, page, pageSize: pageSize || 20 }
    }
    return this.comentarioRepo.find({ where, relations: ['user'], order: { createdAt: 'DESC' } })
  }

  async comentariosBySesion(sesionId: number) {
    return this.comentarioRepo.find({
      where: { sesion_id: sesionId, padre_id: IsNull() },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    })
  }

  async respuestas(comentarioId: number) {
    return this.comentarioRepo.find({
      where: { padre_id: comentarioId },
      relations: ['user'],
      order: { createdAt: 'ASC' },
    })
  }

  async eliminarComentario(id: number, userId: number) {
    const c = await this.comentarioRepo.findOneBy({ id })
    if (!c) throw new NotFoundException('Comentario no encontrado')
    if (c.user_id !== userId) throw new BadRequestException('No autorizado')
    await this.comentarioRepo.remove(c)
    return { mensaje: 'Comentario eliminado' }
  }

  // --- Likes ---
  async toggleLike(userId: number, comentarioId: number) {
    const existente = await this.likeRepo.findOne({
      where: { user_id: userId, comentario_id: comentarioId },
    })

    if (existente) {
      await this.likeRepo.remove(existente)
      await this.comentarioRepo.decrement({ id: comentarioId }, 'likes_count', 1)
      return { liked: false }
    } else {
      const like = this.likeRepo.create({ user_id: userId, comentario_id: comentarioId })
      await this.likeRepo.save(like)
      await this.comentarioRepo.increment({ id: comentarioId }, 'likes_count', 1)
      return { liked: true }
    }
  }

  async likesByComentario(comentarioId: number) {
    return this.likeRepo.find({
      where: { comentario_id: comentarioId },
      relations: ['user'],
    })
  }

  // --- Trivia ---
  async crearTrivia(cursoId: number, data: {
    titulo: string; descripcion?: string; puntos_por_pregunta?: number
  }) {
    const trivia = this.triviaRepo.create({ curso_id: cursoId, ...data })
    return this.triviaRepo.save(trivia)
  }

  async triviasByCurso(cursoId: number) {
    return this.triviaRepo.find({ where: { curso_id: cursoId }, order: { createdAt: 'DESC' } })
  }

  async submitTrivia(triviaId: number, userId: number, respuestas: number[], respuestasCorrectas: number[]) {
    const trivia = await this.triviaRepo.findOneBy({ id: triviaId })
    if (!trivia) throw new NotFoundException('Trivia no encontrada')
    if (!trivia.activa) throw new BadRequestException('Trivia cerrada')

    const existente = await this.respuestaRepo.findOne({
      where: { trivia_id: triviaId, user_id: userId },
    })
    if (existente) throw new BadRequestException('Ya respondiste esta trivia')

    let correctas = 0
    for (let i = 0; i < respuestas.length; i++) {
      if (respuestas[i] === respuestasCorrectas[i]) correctas++
    }

    const puntos = correctas * trivia.puntos_por_pregunta

    const r = this.respuestaRepo.create({
      trivia_id: triviaId,
      user_id: userId,
      respuestas,
      correctas,
      total: respuestas.length,
      puntos,
    })
    return this.respuestaRepo.save(r)
  }

  async resultadosTrivia(triviaId: number) {
    const trivia = await this.triviaRepo.findOneBy({ id: triviaId })
    if (!trivia) throw new NotFoundException('Trivia no encontrada')

    const respuestas = await this.respuestaRepo.find({
      where: { trivia_id: triviaId },
      relations: ['user'],
      order: { puntos: 'DESC' },
    })

    return {
      trivia,
      participantes: respuestas.length,
      ranking: respuestas.map((r, i) => ({
        posicion: i + 1,
        user: r.user,
        correctas: r.correctas,
        total: r.total,
        puntos: r.puntos,
      })),
    }
  }
}
