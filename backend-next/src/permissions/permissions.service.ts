import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Permission, RolePermission } from './permission.entity.js'

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(Permission) private permRepo: Repository<Permission>,
    @InjectRepository(RolePermission) private rolePermRepo: Repository<RolePermission>,
  ) {}

  async crear(data: { nombre: string; clave: string; descripcion?: string; categoria?: string }) {
    return this.permRepo.save(data)
  }

  async findAll() {
    return this.permRepo.find({ order: { categoria: 'ASC', nombre: 'ASC' } })
  }

  async asignarRol(rol: string, permissionId: number) {
    const exists = await this.rolePermRepo.findOne({ where: { rol, permission_id: permissionId } })
    if (!exists) return this.rolePermRepo.save({ rol, permission_id: permissionId })
    return exists
  }

  async removerRol(rol: string, permissionId: number) {
    await this.rolePermRepo.delete({ rol, permission_id: permissionId })
  }

  async permisosDeRol(rol: string) {
    const rps = await this.rolePermRepo.find({ where: { rol } })
    const ids = rps.map(rp => rp.permission_id)
    if (!ids.length) return []
    return this.permRepo.findByIds(ids)
  }

  async tienePermiso(rol: string, clave: string) {
    const perm = await this.permRepo.findOne({ where: { clave } })
    if (!perm) return false
    const rp = await this.rolePermRepo.findOne({ where: { rol, permission_id: perm.id } })
    return !!rp
  }
}
