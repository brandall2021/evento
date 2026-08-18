import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Permission } from './entities/permission.entity.js'

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(Permission)
    private readonly permRepo: Repository<Permission>,
  ) {}

  async findAll(): Promise<Permission[]> {
    return this.permRepo.find({ order: { module: 'ASC', action: 'ASC' } })
  }

  async findByModule(mod: string): Promise<Permission[]> {
    return this.permRepo.find({ where: { module: mod }, order: { action: 'ASC' } })
  }

  async findByCodes(codes: string[]): Promise<Permission[]> {
    if (!codes.length) return []
    return this.permRepo.createQueryBuilder('p').where('p.code IN (:...codes)', { codes }).getMany()
  }

  async findByIds(ids: string[]): Promise<Permission[]> {
    if (!ids.length) return []
    return this.permRepo.createQueryBuilder('p').where('p.id IN (:...ids)', { ids }).getMany()
  }

  async tienePermiso(roleId: string, permissionCode: string): Promise<boolean> {
    const perm = await this.permRepo.findOne({ where: { code: permissionCode } })
    if (!perm) return false
    const result = await this.permRepo.manager.query(
      'SELECT 1 FROM evento.role_permissions WHERE role_id = $1 AND permission_id = $2 LIMIT 1',
      [roleId, perm.id],
    )
    return result.length > 0
  }
}
