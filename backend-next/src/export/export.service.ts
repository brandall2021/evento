import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Curso } from '../cursos/curso.entity.js'
import { Inscripcion } from '../inscripciones/inscripcion.entity.js'
import { Pago } from '../pagos/pago.entity.js'
import { Asistencia } from '../asistencias/asistencia.entity.js'
import { Certificado } from '../certificados/certificado.entity.js'

@Injectable()
export class ExportService {
  constructor(
    @InjectRepository(Curso) private cursoRepo: Repository<Curso>,
    @InjectRepository(Inscripcion) private inscripcionRepo: Repository<Inscripcion>,
    @InjectRepository(Pago) private pagoRepo: Repository<Pago>,
    @InjectRepository(Asistencia) private asistenciaRepo: Repository<Asistencia>,
    @InjectRepository(Certificado) private certificadoRepo: Repository<Certificado>,
  ) {}

  async cursosCsv() {
    const cursos = await this.cursoRepo.find({ order: { createdAt: 'DESC' } })
    return this.toCsv(cursos, [
      'id', 'nombre', 'categoria', 'modalidad', 'estado', 'cupos', 'precio',
      'fecha_inicio', 'fecha_fin', 'duracion_horas', 'createdAt',
    ])
  }

  async inscripcionesCsv(cursoId?: number) {
    const where = cursoId ? { curso_id: cursoId } : {}
    const inscripciones = await this.inscripcionRepo.find({ where, order: { createdAt: 'DESC' } })
    return this.toCsv(inscripciones, ['id', 'estudiante_id', 'curso_id', 'estado', 'createdAt'])
  }

  async pagosCsv() {
    const pagos = await this.pagoRepo.find({ order: { createdAt: 'DESC' } })
    return this.toCsv(pagos, ['id', 'inscripcion_id', 'monto', 'metodo', 'estado', 'createdAt'])
  }

  async asistenciasCsv(cursoId: number) {
    const asistencias = await this.asistenciaRepo.createQueryBuilder('a')
      .leftJoinAndSelect('a.inscripcion', 'i')
      .where('i.curso_id = :cursoId', { cursoId })
      .orderBy('a.createdAt', 'DESC')
      .getMany()
    return this.toCsv(asistencias, ['id', 'inscripcion_id', 'fecha', 'presente', 'createdAt'])
  }

  async certificadosCsv() {
    const certificados = await this.certificadoRepo.find({ order: { createdAt: 'DESC' } })
    return this.toCsv(certificados, ['id', 'inscripcion_id', 'codigo', 'horas', 'createdAt'])
  }

  async certificadosJson() {
    return this.certificadoRepo.find({ order: { createdAt: 'DESC' } })
  }

  private toCsv(data: any[], columns: string[]): string {
    if (!data.length) return columns.join(',') + '\n'
    const header = columns.join(',')
    const rows = data.map(row =>
      columns.map(col => {
        const val = row[col]
        if (val === null || val === undefined) return ''
        const str = String(val)
        return str.includes(',') || str.includes('"') || str.includes('\n')
          ? `"${str.replace(/"/g, '""')}"` : str
      }).join(',')
    )
    return header + '\n' + rows.join('\n')
  }
}
