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
import { User } from './user.entity'
import { Role } from '../../roles/entities/role.entity'
import { Tenant } from '../../tenants/entities/tenant.entity'

@Entity('user_roles', { schema: 'evento' })
@Unique('uq_user_role_tenant', ['user_id', 'role_id', 'tenant_id'])
export class UserRole {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Index('idx_user_roles_user')
  @Column({ name: 'user_id', type: 'uuid' })
  user_id: string

  @ManyToOne(() => User, u => u.user_roles, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User

  @Column({ name: 'role_id', type: 'uuid' })
  role_id: string

  @ManyToOne(() => Role, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'role_id' })
  role: Role

  @Index('idx_user_roles_tenant')
  @Column({ name: 'tenant_id', type: 'uuid' })
  tenant_id: string

  @ManyToOne(() => Tenant, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  created_at: Date
}
