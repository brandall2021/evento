import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm'

@Entity('tenants', { schema: 'evento' })
export class Tenant {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  name: string

  @Column({ unique: true })
  slug: string

  @Column({ nullable: true })
  domain: string

  @Column({ nullable: true })
  logo_url: string

  @Column({ nullable: true })
  banner_url: string

  @Column({ type: 'jsonb', default: () => "'{}'" })
  settings: Record<string, unknown>

  @Column({ default: true })
  is_active: boolean

  @CreateDateColumn()
  created_at: Date

  @UpdateDateColumn()
  updated_at: Date

  @DeleteDateColumn()
  deleted_at: Date
}
