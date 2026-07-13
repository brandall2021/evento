import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm'

@Entity('webhooks')
export class Webhook {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  url: string

  @Column({ type: 'simple-array' })
  eventos: string[]

  @Column({ default: true })
  activo: boolean

  @Column({ nullable: true })
  secret: string

  @Column({ nullable: true })
  user_id: number

  @CreateDateColumn()
  created_at: Date
}

@Entity('webhook_events')
export class WebhookEvent {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  webhook_id: number

  @Column()
  evento: string

  @Column({ type: 'jsonb' })
  payload: any

  @Column({ default: 'pendiente' })
  estado: string

  @Column({ nullable: true })
  respuesta_status: number | null

  @Column({ nullable: true })
  respuesta_body: string | null

  @Column({ type: 'int', default: 0 })
  intentos: number

  @Column({ type: 'timestamp', nullable: true })
  enviado_at: Date | null

  @Column({ type: 'timestamp', nullable: true })
  completado_at: Date | null

  @CreateDateColumn()
  created_at: Date
}
