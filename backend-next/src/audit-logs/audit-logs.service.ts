import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { AuditLog } from './audit-log.entity.js'

@Injectable()
export class AuditLogsService {
  constructor(
    @InjectRepository(AuditLog) private auditRepo: Repository<AuditLog>,
  ) {}

  async log(data: { user_id?: number; accion: string; entidad: string; entidad_id?: number; datos_previos?: any; datos_nuevos?: any; ip?: string; user_agent?: string }) {
    return this.auditRepo.save(data)
  }

  async findAll(page = 1, limit = 50) {
    const [items, total] = await this.auditRepo.findAndCount({
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    })
    return { items, total, page, pageSize: limit, totalPages: Math.ceil(total / limit) }
  }

  async byEntidad(entidad: string) {
    return this.auditRepo.find({ where: { entidad }, order: { createdAt: 'DESC' }, take: 100 })
  }

  async byUser(userId: number) {
    return this.auditRepo.find({ where: { user_id: userId }, order: { createdAt: 'DESC' }, take: 100 })
  }
}
