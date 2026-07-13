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
import { Comentario } from './comentario.entity.js'

@Entity('likes')
@Unique(['user_id', 'comentario_id'])
export class Like {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  user_id: number

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'user_id' })
  user: User

  @Column()
  comentario_id: number

  @ManyToOne(() => Comentario, { eager: false })
  @JoinColumn({ name: 'comentario_id' })
  comentario: Comentario

  @CreateDateColumn()
  createdAt: Date
}
