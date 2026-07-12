import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Curso, EstadoCurso } from './curso.entity.js'
import { User, UserRole } from '../users/user.entity.js'

@Injectable()
export class CursosService {
  constructor(
    @InjectRepository(Curso)
    private readonly cursoRepo: Repository<Curso>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async findAll(
    user: any,
    filters?: { page?: number; pageSize?: number },
  ) {
    const qb = this.cursoRepo.createQueryBuilder('curso')
    qb.leftJoinAndSelect('curso.docente', 'docente')
      .select([
        'curso',
        'docente.id',
        'docente.nombre',
        'docente.email',
      ])
      .orderBy('curso.createdAt', 'DESC')

    if (user.rol !== UserRole.ADMIN && user.rol !== UserRole.DOCENTE) {
      qb.andWhere('curso.estado = :estado', { estado: EstadoCurso.PUBLICADO })
    }

    if (user.rol === UserRole.DOCENTE) {
      qb.andWhere('curso.docente_id = :docenteId', { docenteId: user.id })
    }

    if (filters?.page) {
      const page = filters.page
      const pageSize = filters.pageSize || 20
      const [data, total] = await qb
        .take(pageSize)
        .skip((page - 1) * pageSize)
        .getManyAndCount()
      return { data, total, page, pageSize }
    }

    return qb.getMany()
  }

  async findById(id: number) {
    const curso = await this.cursoRepo.findOne({
      where: { id },
      relations: ['docente'],
    })
    if (!curso) throw new NotFoundException('Curso no encontrado')
    return curso
  }

  async create(data: Partial<Curso>, userId: number, imagenFilename?: string) {
    const docente = await this.userRepo.findOneBy({ id: userId })
    if (!docente) throw new BadRequestException('Usuario no válido')

    const curso = this.cursoRepo.create({
      ...data,
      docente_id: userId,
      imagen: imagenFilename ?? null,
    })
    return this.cursoRepo.save(curso)
  }

  async update(
    id: number,
    data: Partial<Curso>,
    user: any,
    imagenFilename?: string,
  ) {
    const curso = await this.findById(id)

    if (user.rol !== UserRole.ADMIN && curso.docente_id !== user.id) {
      throw new ForbiddenException('No autorizado')
    }

    if (imagenFilename) {
      curso.imagen = imagenFilename
    }

    Object.assign(curso, {
      nombre: data.nombre || curso.nombre,
      descripcion: data.descripcion !== undefined ? data.descripcion : curso.descripcion,
      categoria: data.categoria !== undefined ? data.categoria : curso.categoria,
      fecha_inicio: data.fecha_inicio || curso.fecha_inicio,
      fecha_fin: data.fecha_fin || curso.fecha_fin,
      duracion_horas: data.duracion_horas || curso.duracion_horas,
      modalidad: data.modalidad || curso.modalidad,
      cupos: data.cupos || curso.cupos,
      precio: data.precio !== undefined ? data.precio : curso.precio,
      requisitos: data.requisitos !== undefined ? data.requisitos : curso.requisitos,
      aceptacion_auto: data.aceptacion_auto !== undefined ? data.aceptacion_auto : curso.aceptacion_auto,
    })

    return this.cursoRepo.save(curso)
  }

  async remove(id: number) {
    const curso = await this.findById(id)
    await this.cursoRepo.remove(curso)
    return { mensaje: 'Curso eliminado' }
  }

  async cambiarEstado(id: number, estado: EstadoCurso, user: any) {
    if (!Object.values(EstadoCurso).includes(estado)) {
      throw new BadRequestException('Estado inválido')
    }

    const curso = await this.findById(id)

    if (user.rol !== UserRole.ADMIN && curso.docente_id !== user.id) {
      throw new ForbiddenException('No autorizado')
    }

    curso.estado = estado
    return this.cursoRepo.save(curso)
  }
}
