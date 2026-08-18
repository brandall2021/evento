import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm'
import { Tenant } from '../../tenants/entities/tenant.entity.js'
import { RolePermission } from './role-permission.entity.js'

@Entity('roles', { schema: 'evento' })
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenant_id: string

  @ManyToOne(() => Tenant, { eager: false })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant

  @Column({ type: 'varchar', length: 100 })
  name: string

  @Column({ type: 'text', nullable: true })
  description: string | null

  @Column({ name: 'is_system', type: 'boolean', default: false })
  is_system: boolean

  @OneToMany(() => RolePermission, rp => rp.role, { cascade: true })
  rolePermissions: RolePermission[]

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date
}
