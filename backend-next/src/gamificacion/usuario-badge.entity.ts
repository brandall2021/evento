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
import { Badge } from './badge.entity.js'

@Entity('usuarios_badges')
@Unique(['user_id', 'badge_id'])
export class UsuarioBadge {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  user_id: number

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'user_id' })
  user: User

  @Column()
  badge_id: number

  @ManyToOne(() => Badge, { eager: false })
  @JoinColumn({ name: 'badge_id' })
  badge: Badge

  @Column({ default: 0 })
  curso_id: number

  @CreateDateColumn()
  otorgado_at: Date
}
