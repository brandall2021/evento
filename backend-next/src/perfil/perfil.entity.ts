import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm'
import { User } from '../users/user.entity.js'

@Entity('perfiles_asistente')
export class PerfilAsistente {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ unique: true })
  user_id: number

  @OneToOne(() => User, { eager: false })
  @JoinColumn({ name: 'user_id' })
  user: User

  @Column({ nullable: true })
  empresa: string

  @Column({ nullable: true })
  cargo: string

  @Column({ type: 'text', nullable: true })
  bio: string

  @Column({ type: 'text', nullable: true })
  intereses: string

  @Column({ type: 'jsonb', default: {} })
  redes_sociales: Record<string, string>

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @DeleteDateColumn()
  deletedAt: Date
}
