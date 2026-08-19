import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { AuditLog, AuditAction } from './entities/audit-log.entity.js'

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditRepo: Repository<AuditLog>,
  ) {}

  async log(data: {
    tenant_id: string
    user_id?: string | null
    action: AuditAction
    entity: string
    entity_id?: string | null
    old_values?: Record<string, unknown> | null
    new_values?: Record<string, unknown> | null
    ip_address?: string | null
    user_agent?: string | null
  }): Promise<AuditLog> {
    const entry = this.auditRepo.create(data as any)
    return this.auditRepo.save(entry as any)
  }

  async findByEntity(entity: string, entity_id?: string): Promise<AuditLog[]> {
    const where: Record<string, unknown> = { entity }
    if (entity_id) {
      where.entity_id = entity_id
    }
    return this.auditRepo.find({ where, order: { created_at: 'DESC' }, take: 100 })
  }

  async findByUser(user_id: string): Promise<AuditLog[]> {
    return this.auditRepo.find({
      where: { user_id },
      order: { created_at: 'DESC' },
      take: 100,
    })
  }
}
