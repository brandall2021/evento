import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm'

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ nullable: true })
  user_id: number | null

  @Column()
  accion: string

  @Column()
  entidad: string

  @Column({ nullable: true })
  entidad_id: number | null

  @Column({ type: 'jsonb', nullable: true })
  datos_previos: any | null

  @Column({ type: 'jsonb', nullable: true })
  datos_nuevos: any | null

  @Column({ nullable: true })
  ip: string | null

  @Column({ nullable: true })
  user_agent: string | null

  @CreateDateColumn()
  createdAt: Date
}
