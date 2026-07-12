import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Reunion, EstadoReunion } from './reunion.entity.js'
import { ParticipanteReunion, EstadoParticipante } from './participante.entity.js'

@Injectable()
export class ReunionesService {
  constructor(
    @InjectRepository(Reunion)
    private readonly reunionRepo: Repository<Reunion>,
    @InjectRepository(ParticipanteReunion)
    private readonly partRepo: Repository<ParticipanteReunion>,
  ) {}

  async crear(organizadorId: number, data: {
    curso_id: number; titulo: string; descripcion?: string;
    fecha_inicio: string; fecha_fin: string; ubicacion?: string; participantes?: number[]
  }) {
    const reunion = this.reunionRepo.create({
      organizador_id: organizadorId,
      curso_id: data.curso_id,
      titulo: data.titulo,
      descripcion: data.descripcion || null,
      fecha_inicio: new Date(data.fecha_inicio),
      fecha_fin: new Date(data.fecha_fin),
      ubicacion: data.ubicacion || null,
    })
    await this.reunionRepo.save(reunion)

    if (data.participantes?.length) {
      const parts = data.participantes.map(uid =>
        this.partRepo.create({ reunion_id: reunion.id, user_id: uid })
      )
      await this.partRepo.save(parts)
    }

    return reunion
  }

  async findByCurso(cursoId: number) {
    return this.reunionRepo.find({
      where: { curso_id: cursoId },
      relations: ['organizador'],
      order: { fecha_inicio: 'ASC' },
    })
  }

  async findById(id: number) {
    const reunion = await this.reunionRepo.findOne({
      where: { id },
      relations: ['organizador'],
    })
    if (!reunion) throw new NotFoundException('Reunión no encontrada')
    return reunion
  }

  async misReuniones(userId: number) {
    const parts = await this.partRepo.find({ where: { user_id: userId } })
    const reunionIds = parts.map(p => p.reunion_id)
    if (reunionIds.length === 0) return []

    return this.reunionRepo.findByIds(reunionIds)
  }

  async responder(reunionId: number, userId: number, aceptar: boolean) {
    const part = await this.partRepo.findOne({ where: { reunion_id: reunionId, user_id: userId } })
    if (!part) throw new NotFoundException('No eres participante de esta reunión')

    part.estado = aceptar ? EstadoParticipante.ACEPTADO : EstadoParticipante.RECHAZADO
    return this.partRepo.save(part)
  }

  async cambiarEstado(id: number, estado: EstadoReunion) {
    const reunion = await this.reunionRepo.findOneBy({ id })
    if (!reunion) throw new NotFoundException('Reunión no encontrada')
    reunion.estado = estado
    return this.reunionRepo.save(reunion)
  }

  async participantes(reunionId: number) {
    return this.partRepo.find({
      where: { reunion_id: reunionId },
      relations: ['user'],
    })
  }
}
