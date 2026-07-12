import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { SalaStreaming } from './sala-streaming.entity.js'
import { EncuestaStreaming } from './encuesta.entity.js'
import { RespuestaEncuesta } from './respuesta-encuesta.entity.js'
import { PreguntaQA } from './pregunta-qa.entity.js'

@Injectable()
export class StreamingService {
  constructor(
    @InjectRepository(SalaStreaming)
    private readonly salaRepo: Repository<SalaStreaming>,
    @InjectRepository(EncuestaStreaming)
    private readonly encuestaRepo: Repository<EncuestaStreaming>,
    @InjectRepository(RespuestaEncuesta)
    private readonly respuestaRepo: Repository<RespuestaEncuesta>,
    @InjectRepository(PreguntaQA)
    private readonly preguntaRepo: Repository<PreguntaQA>,
  ) {}

  // --- Salas ---
  async crearSala(cursoId: number, data: {
    titulo: string; plataforma: string; sesion_id?: number;
    url_stream?: string; url_chat?: string
  }) {
    const sala = this.salaRepo.create({
      curso_id: cursoId,
      titulo: data.titulo,
      plataforma: data.plataforma as any,
      sesion_id: data.sesion_id || null,
      url_stream: data.url_stream || null,
      url_chat: data.url_chat || null,
    })
    return this.salaRepo.save(sala)
  }

  async salasByCurso(cursoId: number) {
    return this.salaRepo.find({
      where: { curso_id: cursoId },
      relations: ['sesion'],
      order: { createdAt: 'DESC' },
    })
  }

  async salaById(id: number) {
    const sala = await this.salaRepo.findOne({ where: { id }, relations: ['sesion'] })
    if (!sala) throw new NotFoundException('Sala de streaming no encontrada')
    return sala
  }

  async activarDesactivar(id: number, activa: boolean) {
    const sala = await this.salaRepo.findOneBy({ id })
    if (!sala) throw new NotFoundException('Sala de streaming no encontrada')
    sala.activa = activa
    if (activa) sala.fecha_inicio = new Date()
    return this.salaRepo.save(sala)
  }

  // --- Encuestas ---
  async crearEncuesta(salaId: number, data: { titulo: string; opciones: string[] }) {
    await this.salaById(salaId)
    const encuesta = this.encuestaRepo.create({ sala_streaming_id: salaId, ...data })
    return this.encuestaRepo.save(encuesta)
  }

  async encuestasBySala(salaId: number) {
    return this.encuestaRepo.find({
      where: { sala_streaming_id: salaId },
      order: { createdAt: 'DESC' },
    })
  }

  async votar(encuestaId: number, userId: number, opcionIndex: number) {
    const encuesta = await this.encuestaRepo.findOneBy({ id: encuestaId })
    if (!encuesta) throw new NotFoundException('Encuesta no encontrada')
    if (!encuesta.activa) throw new BadRequestException('Encuesta cerrada')

    const existente = await this.respuestaRepo.findOne({
      where: { encuesta_id: encuestaId, user_id: userId },
    })
    if (existente) throw new BadRequestException('Ya votaste en esta encuesta')

    const respuesta = this.respuestaRepo.create({
      encuesta_id: encuestaId,
      user_id: userId,
      opcion_index: opcionIndex,
    })
    return this.respuestaRepo.save(respuesta)
  }

  async resultadosEncuesta(encuestaId: number) {
    const encuesta = await this.encuestaRepo.findOneBy({ id: encuestaId })
    if (!encuesta) throw new NotFoundException('Encuesta no encontrada')

    const respuestas = await this.respuestaRepo.find({ where: { encuesta_id: encuestaId } })
    const total = respuestas.length
    const conteo = encuesta.opciones.map((_, i) => ({
      indice: i,
      opcion: encuesta.opciones[i],
      votos: respuestas.filter(r => r.opcion_index === i).length,
      porcentaje: total > 0 ? Math.round((respuestas.filter(r => r.opcion_index === i).length / total) * 100) : 0,
    }))

    return { encuesta, total_votos: total, resultados: conteo }
  }

  // --- Q&A ---
  async hacerPregunta(salaId: number, userId: number, pregunta: string) {
    await this.salaById(salaId)
    const p = this.preguntaRepo.create({ sala_streaming_id: salaId, user_id: userId, pregunta })
    return this.preguntaRepo.save(p)
  }

  async preguntasBySala(salaId: number) {
    return this.preguntaRepo.find({
      where: { sala_streaming_id: salaId },
      relations: ['user'],
      order: { votos: 'DESC', createdAt: 'ASC' },
    })
  }

  async votarPregunta(preguntaId: number) {
    const p = await this.preguntaRepo.findOneBy({ id: preguntaId })
    if (!p) throw new NotFoundException('Pregunta no encontrada')
    p.votos += 1
    return this.preguntaRepo.save(p)
  }

  async responderPregunta(preguntaId: number, respuesta: string) {
    const p = await this.preguntaRepo.findOneBy({ id: preguntaId })
    if (!p) throw new NotFoundException('Pregunta no encontrada')
    p.respondida = true
    p.respuesta = respuesta
    return this.preguntaRepo.save(p)
  }
}
