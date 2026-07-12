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

@Entity('perfiles_ponente')
export class PerfilPonente {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ unique: true })
  user_id: number

  @OneToOne(() => User, { eager: false })
  @JoinColumn({ name: 'user_id' })
  user: User

  @Column({ nullable: true })
  cv_url: string

  @Column({ nullable: true })
  especialidad: string

  @Column({ type: 'text', nullable: true })
  bio_corta: string

  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true })
  calificacion: number

  @Column({ nullable: true })
  anos_experiencia: number

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @DeleteDateColumn()
  deletedAt: Date
}
