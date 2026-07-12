import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm'
import { User } from '../users/user.entity.js'
import { Curso } from '../cursos/curso.entity.js'

@Entity('expositores')
export class Expositor {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  user_id: number

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'user_id' })
  user: User

  @Column()
  curso_id: number

  @ManyToOne(() => Curso, { eager: false })
  @JoinColumn({ name: 'curso_id' })
  curso: Curso

  @Column()
  nombre_empresa: string

  @Column({ type: 'text', nullable: true })
  descripcion: string

  @Column({ nullable: true })
  logo_url: string

  @Column({ nullable: true })
  stand_numero: string

  @Column({ nullable: true })
  stand_ubicacion: string

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @DeleteDateColumn()
  deletedAt: Date
}
