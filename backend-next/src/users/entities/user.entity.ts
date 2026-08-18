import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
} from 'typeorm'
import * as bcrypt from 'bcryptjs'
import { UserTenant } from './user-tenant.entity.js'
import { UserRole } from './user-role.entity.js'
import { RefreshToken } from './refresh-token.entity.js'

@Entity('users', { schema: 'evento' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ unique: true })
  email: string

  @Column({ name: 'password_hash', type: 'varchar', length: 255, select: false })
  password_hash: string

  @Column({ name: 'first_name', type: 'varchar', length: 100 })
  first_name: string

  @Column({ name: 'last_name', type: 'varchar', length: 100 })
  last_name: string

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string | null

  @Column({ name: 'avatar_url', type: 'varchar', length: 500, nullable: true })
  avatar_url: string | null

  @Column({ name: 'is_active', type: 'boolean', default: true })
  is_active: boolean

  @Column({ name: 'email_verified', type: 'boolean', default: false })
  email_verified: boolean

  @Column({ name: 'last_login_at', type: 'timestamptz', nullable: true })
  last_login_at: Date | null

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  created_at: Date

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updated_at: Date

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz' })
  deleted_at: Date | null

  @OneToMany(() => UserTenant, ut => ut.user)
  user_tenants: UserTenant[]

  @OneToMany(() => UserRole, ur => ur.user)
  user_roles: UserRole[]

  @OneToMany(() => RefreshToken, rt => rt.user)
  refresh_tokens: RefreshToken[]

  async comparePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password_hash)
  }
}
