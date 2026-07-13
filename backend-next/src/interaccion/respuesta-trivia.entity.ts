import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm'
import { Trivia } from './trivia.entity.js'
import { User } from '../users/user.entity.js'

@Entity('respuestas_trivia')
@Unique(['trivia_id', 'user_id'])
export class RespuestaTrivia {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  trivia_id: number

  @ManyToOne(() => Trivia, { eager: false })
  @JoinColumn({ name: 'trivia_id' })
  trivia: Trivia

  @Column()
  user_id: number

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'user_id' })
  user: User

  @Column({ type: 'jsonb' })
  respuestas: number[]

  @Column()
  correctas: number

  @Column()
  total: number

  @Column({ default: 0 })
  puntos: number

  @CreateDateColumn()
  createdAt: Date
}
