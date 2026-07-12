import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm'
import { Conversacion } from './conversacion.entity.js'
import { User } from '../users/user.entity.js'

@Entity('participantes_conversacion')
@Unique(['conversacion_id', 'user_id'])
export class ParticipanteConversacion {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  conversacion_id: number

  @ManyToOne(() => Conversacion, { eager: false })
  @JoinColumn({ name: 'conversacion_id' })
  conversacion: Conversacion

  @Column()
  user_id: number

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'user_id' })
  user: User

  @Column({ type: 'timestamp', nullable: true })
  ultimo_leido_at: Date

  @CreateDateColumn()
  createdAt: Date
}
