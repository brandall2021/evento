import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm'
import { User } from '../users/user.entity.js'

@Entity('blog_posts')
export class BlogPost {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  titulo: string

  @Column({ unique: true })
  slug: string

  @Column({ type: 'text', nullable: true })
  resumen: string

  @Column({ type: 'text' })
  contenido: string

  @Column({ nullable: true })
  imagen_portada: string

  @Column({ nullable: true })
  autor_id: number

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'autor_id' })
  autor: User

  @Column({ default: false })
  publicado: boolean

  @Column({ type: 'text', nullable: true })
  meta_title: string

  @Column({ type: 'text', nullable: true })
  meta_description: string

  @Column({ default: 0 })
  vistas: number

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @DeleteDateColumn()
  deletedAt: Date
}
