import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Organizacion, OrganizacionMiembro } from './organizacion.entity.js'

@Injectable()
export class OrganizacionesService {
  constructor(
    @InjectRepository(Organizacion) private orgRepo: Repository<Organizacion>,
    @InjectRepository(OrganizacionMiembro) private miembroRepo: Repository<OrganizacionMiembro>,
  ) {}

  async crear(data: { nombre: string; slug?: string; descripcion?: string; plan?: string }) {
    return this.orgRepo.save(data)
  }

  async findAll() {
    return this.orgRepo.find({ order: { createdAt: 'DESC' } })
  }

  async findById(id: number) {
    return this.orgRepo.findOne({ where: { id }, relations: ['miembros'] })
  }

  async actualizar(id: number, data: Partial<Organizacion>) {
    await this.orgRepo.update(id, data)
    return this.orgRepo.findOne({ where: { id } })
  }

  async agregarMiembro(organizacionId: number, userId: number, rol = 'miembro') {
    return this.miembroRepo.save({ organizacion_id: organizacionId, user_id: userId, rol })
  }

  async removerMiembro(organizacionId: number, userId: number) {
    await this.miembroRepo.delete({ organizacion_id: organizacionId, user_id: userId })
  }

  async miembros(organizacionId: number) {
    return this.miembroRepo.find({ where: { organizacion_id: organizacionId } })
  }

  async misOrganizaciones(userId: number) {
    return this.miembroRepo.find({ where: { user_id: userId } })
  }
}
