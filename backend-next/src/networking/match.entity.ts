import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm'
import { User } from '../users/user.entity.js'
import { Curso } from '../cursos/curso.entity.js'

export enum EstadoMatch {
  PENDIENTE = 'pendiente',
  ACEPTADO = 'aceptado',
  RECHAZADO = 'rechazado',
}

@Entity('matches_networking')
@Unique(['user_a_id', 'user_b_id', 'curso_id'])
export class MatchNetworking {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  user_a_id: number

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'user_a_id' })
  user_a: User

  @Column()
  user_b_id: number

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'user_b_id' })
  user_b: User

  @Column()
  curso_id: number

  @ManyToOne(() => Curso, { eager: false })
  @JoinColumn({ name: 'curso_id' })
  curso: Curso

  @Column({ type: 'enum', enum: EstadoMatch, default: EstadoMatch.PENDIENTE })
  estado: EstadoMatch

  @Column({ type: 'text', nullable: true })
  mensaje: string | null

  @CreateDateColumn()
  createdAt: Date
}
