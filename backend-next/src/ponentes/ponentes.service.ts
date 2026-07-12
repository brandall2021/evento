import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { PerfilPonente } from './perfil-ponente.entity.js'

@Injectable()
export class PonentesService {
  constructor(
    @InjectRepository(PerfilPonente)
    private readonly ponenteRepo: Repository<PerfilPonente>,
  ) {}

  async findOrCreate(userId: number) {
    let perfil = await this.ponenteRepo.findOne({ where: { user_id: userId } })
    if (!perfil) {
      perfil = this.ponenteRepo.create({ user_id: userId })
      await this.ponenteRepo.save(perfil)
    }
    return perfil
  }

  async findByUserId(userId: number) {
    const perfil = await this.ponenteRepo.findOne({
      where: { user_id: userId },
      relations: ['user'],
    })
    if (!perfil) throw new NotFoundException('Perfil de ponente no encontrado')
    return perfil
  }

  async findById(id: number) {
    const perfil = await this.ponenteRepo.findOne({
      where: { id },
      relations: ['user'],
    })
    if (!perfil) throw new NotFoundException('Perfil de ponente no encontrado')
    return perfil
  }

  async update(userId: number, data: {
    cv_url?: string
    especialidad?: string
    bio_corta?: string
    calificacion?: number
    anos_experiencia?: number
  }) {
    let perfil = await this.ponenteRepo.findOne({ where: { user_id: userId } })
    if (!perfil) {
      perfil = this.ponenteRepo.create({ user_id: userId })
    }

    Object.assign(perfil, {
      cv_url: data.cv_url !== undefined ? data.cv_url : perfil.cv_url,
      especialidad: data.especialidad !== undefined ? data.especialidad : perfil.especialidad,
      bio_corta: data.bio_corta !== undefined ? data.bio_corta : perfil.bio_corta,
      calificacion: data.calificacion !== undefined ? data.calificacion : perfil.calificacion,
      anos_experiencia: data.anos_experiencia !== undefined ? data.anos_experiencia : perfil.anos_experiencia,
    })

    return this.ponenteRepo.save(perfil)
  }

  async findAll(page?: number, pageSize?: number) {
    if (page) {
      const [data, total] = await this.ponenteRepo.findAndCount({
        relations: ['user'],
        order: { createdAt: 'DESC' },
        take: pageSize || 20,
        skip: (page - 1) * (pageSize || 20),
      })
      return { data, total, page, pageSize: pageSize || 20 }
    }
    return this.ponenteRepo.find({ relations: ['user'], order: { createdAt: 'DESC' } })
  }

  async remove(userId: number) {
    const perfil = await this.ponenteRepo.findOneBy({ user_id: userId })
    if (!perfil) throw new NotFoundException('Perfil de ponente no encontrado')
    await this.ponenteRepo.remove(perfil)
    return { mensaje: 'Perfil de ponente eliminado' }
  }
}
