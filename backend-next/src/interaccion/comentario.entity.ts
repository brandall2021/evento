import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm'
import { User } from '../users/user.entity.js'

@Entity('comentarios')
export class Comentario {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  user_id: number

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'user_id' })
  user: User

  @Column({ nullable: true })
  curso_id: number | null

  @Column({ nullable: true })
  sesion_id: number | null

  @Column({ type: 'text' })
  contenido: string

  @Column({ nullable: true })
  padre_id: number | null

  @Column({ default: 0 })
  likes_count: number

  @CreateDateColumn()
  createdAt: Date
}
