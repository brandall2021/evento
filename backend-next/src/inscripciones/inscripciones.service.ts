import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Inscripcion, EstadoInscripcion } from './inscripcion.entity.js'
import { Curso, EstadoCurso } from '../cursos/curso.entity.js'
import { User, UserRole } from '../users/user.entity.js'

@Injectable()
export class InscripcionesService {
  constructor(
    @InjectRepository(Inscripcion)
    private readonly inscRepo: Repository<Inscripcion>,
    @InjectRepository(Curso)
    private readonly cursoRepo: Repository<Curso>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  private async verificarCupos(cursoId: number): Promise<boolean> {
    const curso = await this.cursoRepo.findOneBy({ id: cursoId })
    if (!curso) throw new NotFoundException('Curso no encontrado')
    const count = await this.inscRepo.count({
      where: { curso_id: cursoId, estado: EstadoInscripcion.ACEPTADO },
    })
    return count < curso.cupos
  }

  async solicitar(cursoId: number, userId: number) {
    const curso = await this.cursoRepo.findOneBy({ id: cursoId })
    if (!curso) throw new NotFoundException('Curso no encontrado')
    if (curso.estado !== EstadoCurso.PUBLICADO) {
      throw new BadRequestException('Curso no disponible')
    }

    const existente = await this.inscRepo.findOne({
      where: { estudiante_id: userId, curso_id: cursoId },
    })
    if (existente) throw new BadRequestException('Ya solicitaste este curso')

    const hayCupos = await this.verificarCupos(cursoId)
    if (!hayCupos) throw new BadRequestException('Cupos agotados')

    let estado = EstadoInscripcion.PENDIENTE
    let fechaAceptacion: Date | null = null
    if (curso.aceptacion_auto && Number(curso.precio) === 0) {
      estado = EstadoInscripcion.ACEPTADO
      fechaAceptacion = new Date()
    }

    const insc = this.inscRepo.create({
      estudiante_id: userId,
      curso_id: cursoId,
      estado,
      fecha_solicitud: new Date(),
      fecha_aceptacion: fechaAceptacion,
    })
    return this.inscRepo.save(insc)
  }

  async misInscripciones(userId: number) {
    return this.inscRepo.find({
      where: { estudiante_id: userId },
      relations: ['curso'],
      order: { createdAt: 'DESC' },
    })
  }

  async findAll(user: any, filters?: { curso_id?: number; estado?: string; page?: number; pageSize?: number }) {
    const where: any = {}

    if (filters?.curso_id) where.curso_id = filters.curso_id
    if (filters?.estado) where.estado = filters.estado

    if (user.rol === UserRole.DOCENTE) {
      const cursos = await this.cursoRepo.find({ where: { docente_id: user.id }, select: ['id'] })
      where.curso_id = cursos.map(c => c.id)
    }

    if (filters?.page) {
      const page = filters.page
      const pageSize = filters.pageSize || 20
      const [data, total] = await this.inscRepo.findAndCount({
        where,
        relations: ['estudiante', 'curso'],
        order: { createdAt: 'DESC' },
        take: pageSize,
        skip: (page - 1) * pageSize,
      })
      return { data, total, page, pageSize }
    }

    return this.inscRepo.find({
      where,
      relations: ['estudiante', 'curso'],
      order: { createdAt: 'DESC' },
    })
  }

  async aprobar(id: number) {
    const insc = await this.inscRepo.findOne({ where: { id }, relations: ['curso'] })
    if (!insc) throw new NotFoundException('Inscripción no encontrada')
    if (insc.estado !== EstadoInscripcion.PENDIENTE) {
      throw new BadRequestException('Inscripción no está pendiente')
    }

    const hayCupos = await this.verificarCupos(insc.curso_id)
    if (!hayCupos) throw new BadRequestException('Cupos agotados')

    insc.estado = EstadoInscripcion.ACEPTADO
    insc.fecha_aceptacion = new Date()
    return this.inscRepo.save(insc)
  }

  async rechazar(id: number, motivo?: string) {
    const insc = await this.inscRepo.findOneBy({ id })
    if (!insc) throw new NotFoundException('Inscripción no encontrada')

    insc.estado = EstadoInscripcion.RECHAZADO
    insc.fecha_rechazo = new Date()
    insc.motivo_rechazo = motivo || ''
    return this.inscRepo.save(insc)
  }
}
