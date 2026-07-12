import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Checkin, MetodoCheckin } from './checkin.entity.js'
import { Inscripcion, EstadoInscripcion } from '../inscripciones/inscripcion.entity.js'
import { Sesion } from '../agenda/sesion.entity.js'
import { Sala } from '../agenda/sala.entity.js'

@Injectable()
export class CheckinService {
  constructor(
    @InjectRepository(Checkin)
    private readonly checkinRepo: Repository<Checkin>,
    @InjectRepository(Inscripcion)
    private readonly inscRepo: Repository<Inscripcion>,
    @InjectRepository(Sesion)
    private readonly sesionRepo: Repository<Sesion>,
    @InjectRepository(Sala)
    private readonly salaRepo: Repository<Sala>,
  ) {}

  async generarQrData(inscripcionId: number) {
    const insc = await this.inscRepo.findOne({
      where: { id: inscripcionId },
      relations: ['curso'],
    })
    if (!insc) throw new NotFoundException('Inscripción no encontrada')
    if (insc.estado !== EstadoInscripcion.ACEPTADO && insc.estado !== EstadoInscripcion.EN_CURSO) {
      throw new BadRequestException('Inscripción no activa')
    }

    const token = Buffer.from(JSON.stringify({
      inscripcion_id: insc.id,
      curso_id: insc.curso_id,
      ts: Date.now(),
    })).toString('base64')

    return {
      inscripcion_id: insc.id,
      curso_id: insc.curso_id,
      curso_nombre: insc.curso.nombre,
      estudiante_id: insc.estudiante_id,
      token,
    }
  }

  async scanQr(token: string, sesionId?: number, salaId?: number, deviceInfo?: string) {
    let payload: any
    try {
      payload = JSON.parse(Buffer.from(token, 'base64').toString())
    } catch {
      throw new BadRequestException('QR inválido')
    }

    const insc = await this.inscRepo.findOneBy({
      id: payload.inscripcion_id,
      curso_id: payload.curso_id,
    })
    if (!insc) throw new BadRequestException('Inscripción no válida')
    if (insc.estado !== EstadoInscripcion.ACEPTADO && insc.estado !== EstadoInscripcion.EN_CURSO) {
      throw new BadRequestException('Inscripción no activa')
    }

    if (sesionId) {
      const existe = await this.checkinRepo.findOne({
        where: { inscripcion_id: insc.id, sesion_id: sesionId },
      })
      if (existe) throw new BadRequestException('Ya registrado en esta sesión')
    }

    const checkin = this.checkinRepo.create({
      inscripcion_id: insc.id,
      sesion_id: sesionId || null,
      sala_id: salaId || null,
      metodo: MetodoCheckin.QR,
      device_info: deviceInfo || null,
    })
    return this.checkinRepo.save(checkin)
  }

  async checkinManual(inscripcionId: number, sesionId?: number, salaId?: number) {
    const insc = await this.inscRepo.findOneBy({ id: inscripcionId })
    if (!insc) throw new NotFoundException('Inscripción no encontrada')

    if (sesionId) {
      const existe = await this.checkinRepo.findOne({
        where: { inscripcion_id: insc.id, sesion_id: sesionId },
      })
      if (existe) throw new BadRequestException('Ya registrado en esta sesión')
    }

    const checkin = this.checkinRepo.create({
      inscripcion_id: inscripcionId,
      sesion_id: sesionId || null,
      sala_id: salaId || null,
      metodo: MetodoCheckin.MANUAL,
    })
    return this.checkinRepo.save(checkin)
  }

  async checkinsBySesion(sesionId: number) {
    return this.checkinRepo.find({
      where: { sesion_id: sesionId },
      relations: ['inscripcion', 'inscripcion.estudiante', 'sala'],
      order: { timestamp: 'ASC' },
    })
  }

  async estadisticas(cursoId: number) {
    const inscripciones = await this.inscRepo.find({
      where: {
        curso_id: cursoId,
        estado: EstadoInscripcion.ACEPTADO as any,
      },
    })

    const totalInscritos = inscripciones.length
    const inscIds = inscripciones.map(i => i.id)

    if (inscIds.length === 0) {
      return { total_inscritos: 0, total_checkins: 0, por_sesion: [] }
    }

    const totalCheckins = await this.checkinRepo
      .createQueryBuilder('c')
      .where('c.inscripcion_id IN (:...ids)', { ids: inscIds })
      .getCount()

    const porSesion = await this.checkinRepo
      .createQueryBuilder('c')
      .select('c.sesion_id', 'sesion_id')
      .addSelect('COUNT(DISTINCT c.inscripcion_id)', 'asistentes_unicos')
      .addSelect('COUNT(*)', 'total_checkins')
      .where('c.inscripcion_id IN (:...ids)', { ids: inscIds })
      .andWhere('c.sesion_id IS NOT NULL')
      .groupBy('c.sesion_id')
      .getRawMany()

    return {
      total_inscritos: totalInscritos,
      total_checkins: totalCheckins,
      por_sesion: porSesion.map(s => ({
        sesion_id: s.sesion_id,
        asistentes_unicos: parseInt(s.asistentes_unicos),
        total_checkins: parseInt(s.total_checkins),
      })),
    }
  }
}
