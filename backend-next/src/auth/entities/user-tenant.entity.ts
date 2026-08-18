import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm'
import { User } from '../../users/user.entity.js'
import { Tenant } from '../../tenants/entities/tenant.entity.js'

@Entity('user_tenants', { schema: 'evento' })
@Unique('uq_user_tenant', ['user_id', 'tenant_id'])
export class UserTenant {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Index('idx_user_tenants_user')
  @Column({ name: 'user_id', type: 'uuid' })
  user_id: string

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User

  @Index('idx_user_tenants_tenant')
  @Column({ name: 'tenant_id', type: 'uuid' })
  tenant_id: string

  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant

  @Column({ name: 'is_active', type: 'boolean', default: true })
  is_active: boolean

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  created_at: Date
}
