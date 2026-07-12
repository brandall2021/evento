import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm'
import { SalaStreaming } from './sala-streaming.entity.js'
import { User } from '../users/user.entity.js'

@Entity('preguntas_qa')
export class PreguntaQA {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  sala_streaming_id: number

  @ManyToOne(() => SalaStreaming, { eager: false })
  @JoinColumn({ name: 'sala_streaming_id' })
  sala_streaming: SalaStreaming

  @Column()
  user_id: number

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'user_id' })
  user: User

  @Column({ type: 'text' })
  pregunta: string

  @Column({ default: false })
  respondida: boolean

  @Column({ type: 'text', nullable: true })
  respuesta: string | null

  @Column({ default: 0 })
  votos: number

  @CreateDateColumn()
  createdAt: Date
}
