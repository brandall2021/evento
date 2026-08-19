import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm'

export enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  REGISTER = 'REGISTER',
  PASSWORD_CHANGE = 'PASSWORD_CHANGE',
  ROLE_CHANGE = 'ROLE_CHANGE',
  TENANT_SWITCH = 'TENANT_SWITCH',
  EXPORT = 'EXPORT',
  BULK_IMPORT = 'BULK_IMPORT',
}

@Entity('audit_logs', { schema: 'evento' })
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenant_id: string

  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  user_id: string | null

  @Column({ type: 'enum', enum: AuditAction, enumName: 'audit_action' })
  action: AuditAction

  @Column({ type: 'varchar', length: 100 })
  entity: string

  @Column({ name: 'entity_id', type: 'uuid', nullable: true })
  entity_id: string | null

  @Column({ name: 'old_values', type: 'jsonb', nullable: true })
  old_values: Record<string, unknown> | null

  @Column({ name: 'new_values', type: 'jsonb', nullable: true })
  new_values: Record<string, unknown> | null

  @Column({ name: 'ip_address', type: 'inet', nullable: true })
  ip_address: string | null

  @Column({ name: 'user_agent', type: 'varchar', length: 500, nullable: true })
  user_agent: string | null

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  created_at: Date
}
