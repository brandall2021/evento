import { Injectable, NotFoundException, ConflictException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { PerfilAsistente } from './perfil.entity.js'

@Injectable()
export class PerfilService {
  constructor(
    @InjectRepository(PerfilAsistente)
    private readonly perfilRepo: Repository<PerfilAsistente>,
  ) {}

  async findOrCreate(userId: number) {
    let perfil = await this.perfilRepo.findOne({ where: { user_id: userId } })
    if (!perfil) {
      perfil = this.perfilRepo.create({ user_id: userId, redes_sociales: {} })
      await this.perfilRepo.save(perfil)
    }
    return perfil
  }

  async findByUserId(userId: number) {
    const perfil = await this.perfilRepo.findOne({
      where: { user_id: userId },
      relations: ['user'],
    })
    if (!perfil) throw new NotFoundException('Perfil no encontrado')
    return perfil
  }

  async update(userId: number, data: {
    empresa?: string
    cargo?: string
    bio?: string
    intereses?: string
    redes_sociales?: Record<string, string>
  }) {
    let perfil = await this.perfilRepo.findOne({ where: { user_id: userId } })
    if (!perfil) {
      perfil = this.perfilRepo.create({ user_id: userId, redes_sociales: {} })
    }

    Object.assign(perfil, {
      empresa: data.empresa !== undefined ? data.empresa : perfil.empresa,
      cargo: data.cargo !== undefined ? data.cargo : perfil.cargo,
      bio: data.bio !== undefined ? data.bio : perfil.bio,
      intereses: data.intereses !== undefined ? data.intereses : perfil.intereses,
      redes_sociales: data.redes_sociales || perfil.redes_sociales,
    })

    return this.perfilRepo.save(perfil)
  }

  async findAll(page?: number, pageSize?: number) {
    if (page) {
      const [data, total] = await this.perfilRepo.findAndCount({
        relations: ['user'],
        order: { createdAt: 'DESC' },
        take: pageSize || 20,
        skip: (page - 1) * (pageSize || 20),
      })
      return { data, total, page, pageSize: pageSize || 20 }
    }
    return this.perfilRepo.find({ relations: ['user'], order: { createdAt: 'DESC' } })
  }
}
