import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from '../users/user.entity.js'
import { Curso, EstadoCurso } from '../cursos/curso.entity.js'
import { Inscripcion, EstadoInscripcion } from '../inscripciones/inscripcion.entity.js'
import { Pago, EstadoPago } from '../pagos/pago.entity.js'
import { Asistencia } from '../asistencias/asistencia.entity.js'
import { Certificado } from '../certificados/certificado.entity.js'

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Curso) private cursoRepo: Repository<Curso>,
    @InjectRepository(Inscripcion) private inscripcionRepo: Repository<Inscripcion>,
    @InjectRepository(Pago) private pagoRepo: Repository<Pago>,
    @InjectRepository(Asistencia) private asistenciaRepo: Repository<Asistencia>,
    @InjectRepository(Certificado) private certificadoRepo: Repository<Certificado>,
  ) {}

  async dashboard() {
    const [totalUsuarios, totalCursos, cursosPublicados, totalInscripciones, inscripcionesAceptadas, totalPagos, totalCertificados, asistencias] = await Promise.all([
      this.userRepo.count(),
      this.cursoRepo.count(),
      this.cursoRepo.count({ where: { estado: EstadoCurso.PUBLICADO } }),
      this.inscripcionRepo.count(),
      this.inscripcionRepo.count({ where: { estado: EstadoInscripcion.ACEPTADO } }),
      this.pagoRepo.count(),
      this.certificadoRepo.count(),
      this.asistenciaRepo.count({ where: { presente: true } }),
    ])

    const pagos = await this.pagoRepo.find()
    const ingresosTotales = pagos.filter(p => p.estado === EstadoPago.PAGADO).reduce((sum, p) => sum + Number(p.monto), 0)
    const ingresosPendientes = pagos.filter(p => p.estado === EstadoPago.PENDIENTE).reduce((sum, p) => sum + Number(p.monto), 0)

    return {
      usuarios: totalUsuarios,
      cursos: { total: totalCursos, publicados: cursosPublicados },
      inscripciones: { total: totalInscripciones, aceptadas: inscripcionesAceptadas },
      pagos: { total: totalPagos, ingresosTotales, ingresosPendientes },
      certificados: totalCertificados,
      asistencias,
    }
  }

  async cursosPorEstado() {
    const [borrador, publicado, finalizado] = await Promise.all([
      this.cursoRepo.count({ where: { estado: EstadoCurso.BORRADOR } }),
      this.cursoRepo.count({ where: { estado: EstadoCurso.PUBLICADO } }),
      this.cursoRepo.count({ where: { estado: EstadoCurso.FINALIZADO } }),
    ])
    return { borrador, publicado, finalizado }
  }

  async inscripcionesPorMes() {
    return this.inscripcionRepo.createQueryBuilder('i')
      .select("TO_CHAR(i.\"createdAt\", 'YYYY-MM')", 'mes')
      .addSelect('COUNT(*)', 'total')
      .groupBy("TO_CHAR(i.\"createdAt\", 'YYYY-MM')")
      .orderBy("TO_CHAR(i.\"createdAt\", 'YYYY-MM')", 'ASC')
      .getRawMany()
  }

  async pagosPorMes() {
    return this.pagoRepo.createQueryBuilder('p')
      .select("TO_CHAR(p.\"createdAt\", 'YYYY-MM')", 'mes')
      .addSelect('SUM(p.monto)', 'total')
      .addSelect('COUNT(*)', 'cantidad')
      .where("p.estado = :estado", { estado: EstadoPago.PAGADO })
      .groupBy("TO_CHAR(p.\"createdAt\", 'YYYY-MM')")
      .orderBy("TO_CHAR(p.\"createdAt\", 'YYYY-MM')", 'ASC')
      .getRawMany()
  }

  async topCursos(limit = 10) {
    return this.inscripcionRepo.createQueryBuilder('i')
      .leftJoinAndSelect('i.curso', 'c')
      .select('c.id', 'curso_id')
      .addSelect('c.nombre', 'curso_nombre')
      .addSelect('COUNT(*)', 'inscripciones')
      .groupBy('c.id')
      .addGroupBy('c.nombre')
      .orderBy('COUNT(*)', 'DESC')
      .limit(limit)
      .getRawMany()
  }

  async asistenciaPorCurso(cursoId: number) {
    const result = await this.asistenciaRepo.createQueryBuilder('a')
      .leftJoin('a.inscripcion', 'i')
      .select('COUNT(*)', 'total')
      .addSelect("SUM(CASE WHEN a.presente = true THEN 1 ELSE 0 END)", 'presentes')
      .where('i.curso_id = :cursoId', { cursoId })
      .getRawOne()
    const total = parseInt(result?.total || '0')
    const presentes = parseInt(result?.presentes || '0')
    return { total, presentes, porcentaje: total > 0 ? Math.round((presentes / total) * 100) : 0 }
  }

  async usuarioStats(userId: number) {
    const inscripciones = await this.inscripcionRepo.count({ where: { estudiante_id: userId } })
    const asistencias = await this.asistenciaRepo.createQueryBuilder('a')
      .leftJoin('a.inscripcion', 'i')
      .where('i.estudiante_id = :userId AND a.presente = true', { userId })
      .getCount()
    const certificados = await this.certificadoRepo.createQueryBuilder('c')
      .leftJoin('c.inscripcion', 'i')
      .where('i.estudiante_id = :userId', { userId })
      .getCount()
    return { inscripciones, asistencias, certificados }
  }
}
