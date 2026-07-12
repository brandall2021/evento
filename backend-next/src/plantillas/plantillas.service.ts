import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { PlantillaCertificado } from './plantilla.entity.js'

@Injectable()
export class PlantillasService {
  constructor(
    @InjectRepository(PlantillaCertificado)
    private readonly plantillaRepo: Repository<PlantillaCertificado>,
  ) {}

  async findAll() {
    return this.plantillaRepo.find({ order: { createdAt: 'DESC' } })
  }

  async findById(id: number) {
    const plantilla = await this.plantillaRepo.findOneBy({ id })
    if (!plantilla) throw new NotFoundException('Plantilla no encontrada')
    return plantilla
  }

  async findDefault() {
    return this.plantillaRepo.findOne({ where: { is_default: true } })
  }

  async create(data: {
    nombre: string
    config?: Record<string, any>
    is_default?: boolean
    firma_url?: string
    logo_url?: string
  }) {
    const config = typeof data.config === 'string' ? JSON.parse(data.config as string) : (data.config || {})

    if (data.is_default) {
      await this.plantillaRepo.createQueryBuilder()
        .update()
        .set({ is_default: false })
        .execute()
    }

    const plantilla = this.plantillaRepo.create({
      nombre: data.nombre,
      config,
      is_default: data.is_default || false,
      firma_url: data.firma_url ?? null,
      logo_url: data.logo_url ?? null,
    })
    return this.plantillaRepo.save(plantilla)
  }

  async update(id: number, data: {
    nombre?: string
    config?: Record<string, any>
    is_default?: boolean
    firma_url?: string
    logo_url?: string
  }) {
    const plantilla = await this.findById(id)

    if (data.config && typeof data.config === 'string') {
      data.config = JSON.parse(data.config as string)
    }

    if (data.is_default) {
      await this.plantillaRepo.createQueryBuilder()
        .update()
        .set({ is_default: false })
        .where('id != :id', { id })
        .execute()
    }

    Object.assign(plantilla, {
      nombre: data.nombre || plantilla.nombre,
      config: data.config || plantilla.config,
      is_default: data.is_default !== undefined ? data.is_default : plantilla.is_default,
      firma_url: data.firma_url !== undefined ? data.firma_url : plantilla.firma_url,
      logo_url: data.logo_url !== undefined ? data.logo_url : plantilla.logo_url,
    })

    return this.plantillaRepo.save(plantilla)
  }

  async remove(id: number) {
    const plantilla = await this.findById(id)
    await this.plantillaRepo.remove(plantilla)
    return { mensaje: 'Plantilla eliminada' }
  }
}
