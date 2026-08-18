import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm'

@Entity('permissions', { schema: 'evento' })
export class Permission {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'varchar', length: 100, unique: true })
  code: string

  @Column({ type: 'varchar', length: 100 })
  module: string

  @Column({ type: 'varchar', length: 100 })
  action: string

  @Column({ type: 'varchar', length: 255, nullable: true })
  description: string | null

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date
}
