import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm'
import { Role } from './role.entity.js'
import { Permission } from '../../permissions/entities/permission.entity.js'

@Entity('role_permissions', { schema: 'evento' })
@Unique('uq_role_permission', ['role_id', 'permission_id'])
export class RolePermission {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ name: 'role_id', type: 'uuid' })
  role_id: string

  @ManyToOne(() => Role, role => role.rolePermissions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'role_id' })
  role: Role

  @Column({ name: 'permission_id', type: 'uuid' })
  permission_id: string

  @ManyToOne(() => Permission, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'permission_id' })
  permission: Permission

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date
}
