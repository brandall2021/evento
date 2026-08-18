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
import { Role } from '../../roles/entities/role.entity.js'
import { Tenant } from '../../tenants/entities/tenant.entity.js'

@Entity('user_roles', { schema: 'evento' })
@Unique('uq_user_role_tenant', ['user_id', 'role_id', 'tenant_id'])
export class UserRoleAssignment {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Index('idx_user_roles_user')
  @Column({ name: 'user_id', type: 'uuid' })
  user_id: string

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User

  @Column({ name: 'role_id', type: 'uuid' })
  role_id: string

  @ManyToOne(() => Role, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'role_id' })
  role: Role

  @Index('idx_user_roles_tenant')
  @Column({ name: 'tenant_id', type: 'uuid' })
  tenant_id: string

  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  created_at: Date
}
