import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm'
import { User } from '../users/user.entity.js'

export enum CanalNotificacion {
  PUSH = 'push',
  EMAIL = 'email',
  SMS = 'sms',
  WHATSAPP = 'whatsapp',
  IN_APP = 'in_app',
}

export enum EstadoNotificacion {
  PENDIENTE = 'pendiente',
  ENVIADA = 'enviada',
  ENTREGADA = 'entregada',
  LEIDA = 'leida',
  ERROR = 'error',
}

@Entity('notificaciones')
export class Notificacion {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  user_id: number

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'user_id' })
  user: User

  @Column()
  titulo: string

  @Column({ type: 'text' })
  contenido: string

  @Column({ type: 'enum', enum: CanalNotificacion, default: CanalNotificacion.IN_APP })
  canal: CanalNotificacion

  @Column({ type: 'enum', enum: EstadoNotificacion, default: EstadoNotificacion.PENDIENTE })
  estado: EstadoNotificacion

  @Column({ nullable: true })
  referencia_tipo: string | null

  @Column({ nullable: true })
  referencia_id: number | null

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any> | null

  @Column({ type: 'timestamp', nullable: true })
  leida_at: Date | null

  @CreateDateColumn()
  createdAt: Date
}
