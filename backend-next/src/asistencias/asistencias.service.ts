import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Asistencia } from './asistencia.entity.js'

@Injectable()
export class AsistenciasService {
  constructor(
    @InjectRepository(Asistencia)
    private readonly asistenciaRepo: Repository<Asistencia>,
  ) {}

  async findByInscripcion(inscripcionId: number) {
    return this.asistenciaRepo.find({
      where: { inscripcion_id: inscripcionId },
      order: { fecha: 'ASC' },
    })
  }

  async registrar(inscripcionId: number, fecha: string, presente: boolean) {
    let asistencia = await this.asistenciaRepo.findOne({
      where: { inscripcion_id: inscripcionId, fecha },
    })
    if (asistencia) {
      asistencia.presente = presente
    } else {
      asistencia = this.asistenciaRepo.create({ inscripcion_id: inscripcionId, fecha, presente })
    }
    return this.asistenciaRepo.save(asistencia)
  }

  async contarPresentes(inscripcionId: number): Promise<{ total: number; presentes: number }> {
    const total = await this.asistenciaRepo.count({ where: { inscripcion_id: inscripcionId } })
    const presentes = await this.asistenciaRepo.count({ where: { inscripcion_id: inscripcionId, presente: true } })
    return { total, presentes }
  }
}
