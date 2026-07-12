import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Patrocinador, CategoriaPatrocinio } from './patrocinador.entity.js'
import { BeneficioPatrocinio } from './beneficio.entity.js'

@Injectable()
export class PatrocinadoresService {
  constructor(
    @InjectRepository(Patrocinador)
    private readonly patrocinadorRepo: Repository<Patrocinador>,
    @InjectRepository(BeneficioPatrocinio)
    private readonly beneficioRepo: Repository<BeneficioPatrocinio>,
  ) {}

  async crear(data: {
    user_id: number
    curso_id: number
    empresa: string
    categoria?: string
    logo_url?: string
    monto?: number
    contacto_nombre?: string
    contacto_email?: string
  }) {
    const patrocinador = this.patrocinadorRepo.create({
      ...data,
      categoria: (data.categoria as CategoriaPatrocinio) || CategoriaPatrocinio.BRONCE,
    })
    return this.patrocinadorRepo.save(patrocinador)
  }

  async findByCurso(cursoId: number) {
    return this.patrocinadorRepo.find({
      where: { curso_id: cursoId },
      relations: ['user'],
      order: { categoria: 'ASC', empresa: 'ASC' },
    })
  }

  async findById(id: number) {
    const patrocinador = await this.patrocinadorRepo.findOne({
      where: { id },
      relations: ['user'],
    })
    if (!patrocinador) throw new NotFoundException('Patrocinador no encontrado')
    return patrocinador
  }

  async actualizar(id: number, data: Partial<Patrocinador>) {
    const patrocinador = await this.findById(id)
    Object.assign(patrocinador, data)
    return this.patrocinadorRepo.save(patrocinador)
  }

  async eliminar(id: number) {
    const patrocinador = await this.findById(id)
    await this.patrocinadorRepo.remove(patrocinador)
    return { mensaje: 'Patrocinador eliminado' }
  }

  // --- Beneficios ---
  async crearBeneficio(patrocinadorId: number, data: {
    tipo: string
    titulo: string
    contenido?: string
    imagen_url?: string
    url?: string
    activo?: boolean
    orden?: number
  }) {
    await this.findById(patrocinadorId)
    const beneficio = this.beneficioRepo.create({
      patrocinador_id: patrocinadorId,
      ...data,
      tipo: data.tipo as any,
    })
    return this.beneficioRepo.save(beneficio)
  }

  async beneficiosByPatrocinador(patrocinadorId: number) {
    return this.beneficioRepo.find({
      where: { patrocinador_id: patrocinadorId },
      order: { orden: 'ASC', createdAt: 'ASC' },
    })
  }

  async actualizarBeneficio(id: number, data: Partial<BeneficioPatrocinio>) {
    const beneficio = await this.beneficioRepo.findOneBy({ id })
    if (!beneficio) throw new NotFoundException('Beneficio no encontrado')
    Object.assign(beneficio, data)
    return this.beneficioRepo.save(beneficio)
  }

  async eliminarBeneficio(id: number) {
    const beneficio = await this.beneficioRepo.findOneBy({ id })
    if (!beneficio) throw new NotFoundException('Beneficio no encontrado')
    await this.beneficioRepo.remove(beneficio)
    return { mensaje: 'Beneficio eliminado' }
  }

  async beneficiosByCurso(cursoId: number) {
    const patrocinadores = await this.patrocinadorRepo.find({
      where: { curso_id: cursoId },
      select: ['id'],
    })
    const patIds = patrocinadores.map(p => p.id)
    if (patIds.length === 0) return []

    return this.beneficioRepo.find({
      where: { patrocinador_id: { $in: patIds } as any, activo: true },
      relations: ['patrocinador'],
      order: { orden: 'ASC' },
    })
  }
}
