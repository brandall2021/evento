import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm'
import { Reunion } from './reunion.entity.js'
import { User } from '../users/user.entity.js'

export enum EstadoParticipante {
  PENDIENTE = 'pendiente',
  ACEPTADO = 'aceptado',
  RECHAZADO = 'rechazado',
}

@Entity('participantes_reunion')
@Unique(['reunion_id', 'user_id'])
export class ParticipanteReunion {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  reunion_id: number

  @ManyToOne(() => Reunion, { eager: false })
  @JoinColumn({ name: 'reunion_id' })
  reunion: Reunion

  @Column()
  user_id: number

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'user_id' })
  user: User

  @Column({ type: 'enum', enum: EstadoParticipante, default: EstadoParticipante.PENDIENTE })
  estado: EstadoParticipante

  @CreateDateColumn()
  createdAt: Date
}
