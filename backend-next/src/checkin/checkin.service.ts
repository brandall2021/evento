import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Acreditacion, MetodoAcreditacion } from './checkin.entity'
import { Inscripcion, EstadoInscripcion } from '../inscripciones/inscripcion.entity'
import { Sesion } from '../agenda/sesion.entity'
import { Sala } from '../agenda/sala.entity'

@Injectable()
export class AcreditacionService {
  constructor(
    @InjectRepository(Acreditacion)
    private readonly acreditacionRepo: Repository<Acreditacion>,
    @InjectRepository(Inscripcion)
    private readonly inscRepo: Repository<Inscripcion>,
    @InjectRepository(Sesion)
    private readonly sesionRepo: Repository<Sesion>,
    @InjectRepository(Sala)
    private readonly salaRepo: Repository<Sala>,
  ) {}

  private buildAccreditationResponse(insc: Inscripcion, alreadyCheckedIn = false) {
    return {
      valid: true,
      ...(alreadyCheckedIn ? { already_checked_in: true } : {}),
      participant: {
        name: `${insc.estudiante.first_name} ${insc.estudiante.last_name}`.trim(),
      },
      event: insc.curso.nombre,
      status: alreadyCheckedIn ? 'ALREADY_CHECKED_IN' : 'CHECKED_IN',
    }
  }

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

    const insc = await this.inscRepo.findOne({
      where: {
        id: payload.inscripcion_id,
        curso_id: payload.curso_id,
      },
      relations: ['curso', 'estudiante'],
    })
    if (!insc) throw new BadRequestException('Inscripción no válida')
    if (insc.estado !== EstadoInscripcion.ACEPTADO && insc.estado !== EstadoInscripcion.EN_CURSO) {
      throw new BadRequestException('Inscripción no activa')
    }

    const existente = await this.acreditacionRepo.findOne({
      where: { inscripcion_id: insc.id },
    })
    if (existente) {
      return this.buildAccreditationResponse(insc, true)
    }

    if (sesionId) {
      const existe = await this.acreditacionRepo.findOne({
        where: { inscripcion_id: insc.id, sesion_id: sesionId },
      })
      if (existe) throw new BadRequestException('Ya registrado en esta sesión')
    }

    const checkin = this.acreditacionRepo.create({
      inscripcion_id: insc.id,
      sesion_id: sesionId || null,
      sala_id: salaId || null,
      metodo: MetodoAcreditacion.QR,
      device_info: deviceInfo || null,
    })
    await this.acreditacionRepo.save(checkin)
    return this.buildAccreditationResponse(insc)
  }

  async checkinManual(inscripcionId: number, sesionId?: number, salaId?: number) {
    const insc = await this.inscRepo.findOne({
      where: { id: inscripcionId },
      relations: ['curso', 'estudiante'],
    })
    if (!insc) throw new NotFoundException('Inscripción no encontrada')

    const existente = await this.acreditacionRepo.findOne({
      where: { inscripcion_id: insc.id },
    })
    if (existente) {
      return this.buildAccreditationResponse(insc, true)
    }

    if (sesionId) {
      const existe = await this.acreditacionRepo.findOne({
        where: { inscripcion_id: insc.id, sesion_id: sesionId },
      })
      if (existe) throw new BadRequestException('Ya registrado en esta sesión')
    }

    const checkin = this.acreditacionRepo.create({
      inscripcion_id: inscripcionId,
      sesion_id: sesionId || null,
      sala_id: salaId || null,
      metodo: MetodoAcreditacion.MANUAL,
    })
    await this.acreditacionRepo.save(checkin)
    return this.buildAccreditationResponse(insc)
  }

  async checkinsBySesion(sesionId: number) {
    return this.acreditacionRepo.find({
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

    const totalCheckins = await this.acreditacionRepo
      .createQueryBuilder('c')
      .where('c.inscripcion_id IN (:...ids)', { ids: inscIds })
      .getCount()

    const porSesion = await this.acreditacionRepo
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

export { AcreditacionService as CheckinService }
