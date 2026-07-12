import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Pago, EstadoPago } from './pago.entity.js'
import { Inscripcion, EstadoInscripcion } from '../inscripciones/inscripcion.entity.js'
import { Curso } from '../cursos/curso.entity.js'
import { User, UserRole } from '../users/user.entity.js'

@Injectable()
export class PagosService {
  constructor(
    @InjectRepository(Pago)
    private readonly pagoRepo: Repository<Pago>,
    @InjectRepository(Inscripcion)
    private readonly inscRepo: Repository<Inscripcion>,
    @InjectRepository(Curso)
    private readonly cursoRepo: Repository<Curso>,
  ) {}

  async crear(data: {
    inscripcion_id: number
    monto: number
    metodo: string
    cuota_numero?: number
    cuota_total?: number
    descuento?: number
  }, userId: number, userRol: string) {
    const insc = await this.inscRepo.findOneBy({ id: data.inscripcion_id })
    if (!insc) throw new NotFoundException('Inscripción no encontrada')
    if (insc.estudiante_id !== userId && userRol !== UserRole.ADMIN) {
      throw new ForbiddenException('No autorizado')
    }

    const pago = this.pagoRepo.create({
      inscripcion_id: data.inscripcion_id,
      monto: data.monto,
      metodo: data.metodo as any,
      cuota_numero: data.cuota_numero || 1,
      cuota_total: data.cuota_total || 1,
      descuento: data.descuento || 0,
    })
    return this.pagoRepo.save(pago)
  }

  async confirmar(id: number) {
    const pago = await this.pagoRepo.findOne({
      where: { id },
      relations: ['inscripcion'],
    })
    if (!pago) throw new NotFoundException('Pago no encontrado')

    pago.estado = EstadoPago.PAGADO
    pago.fecha_pago = new Date()
    await this.pagoRepo.save(pago)

    const insc = pago.inscripcion
    const curso = await this.cursoRepo.findOneBy({ id: insc.curso_id })
    if (curso?.aceptacion_auto && insc.estado === EstadoInscripcion.PENDIENTE) {
      const totalPagado = await this.pagoRepo
        .createQueryBuilder('pago')
        .select('SUM(pago.monto)', 'total')
        .where('pago.inscripcion_id = :inscId', { inscId: insc.id })
        .andWhere('pago.estado = :estado', { estado: EstadoPago.PAGADO })
        .getRawOne()

      if (Number(totalPagado?.total || 0) >= Number(curso.precio)) {
        insc.estado = EstadoInscripcion.ACEPTADO
        insc.fecha_aceptacion = new Date()
        await this.inscRepo.save(insc)
      }
    }

    return pago
  }

  async findAll(user: any, filters?: { page?: number; pageSize?: number }) {
    const where: any = {}

    if (user.rol === UserRole.ESTUDIANTE) {
      const inscr = await this.inscRepo.find({ where: { estudiante_id: user.id }, select: ['id'] })
      where.inscripcion_id = inscr.map(i => i.id)
    }

    if (filters?.page) {
      const page = filters.page
      const pageSize = filters.pageSize || 20
      const [data, total] = await this.pagoRepo.findAndCount({
        where,
        relations: ['inscripcion', 'inscripcion.curso'],
        order: { createdAt: 'DESC' },
        take: pageSize,
        skip: (page - 1) * pageSize,
      })
      return { data, total, page, pageSize }
    }

    return this.pagoRepo.find({
      where,
      relations: ['inscripcion', 'inscripcion.curso'],
      order: { createdAt: 'DESC' },
    })
  }
}
