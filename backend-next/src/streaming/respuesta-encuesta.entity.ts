import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm'
import { EncuestaStreaming } from './encuesta.entity.js'
import { User } from '../users/user.entity.js'

@Entity('respuestas_encuesta')
@Unique(['encuesta_id', 'user_id'])
export class RespuestaEncuesta {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  encuesta_id: number

  @ManyToOne(() => EncuestaStreaming, { eager: false })
  @JoinColumn({ name: 'encuesta_id' })
  encuesta: EncuestaStreaming

  @Column()
  user_id: number

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'user_id' })
  user: User

  @Column()
  opcion_index: number

  @CreateDateColumn()
  createdAt: Date
}
