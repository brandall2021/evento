import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToOne,
  JoinColumn,
} from 'typeorm'
import { User } from '../users/user.entity.js'
import { Curso } from '../cursos/curso.entity.js'
import { Inscripcion } from '../inscripciones/inscripcion.entity.js'

@Entity('credenciales')
export class Credencial {
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

  @Column({ unique: true })
  inscripcion_id: number

  @OneToOne(() => Inscripcion, { eager: false })
  @JoinColumn({ name: 'inscripcion_id' })
  inscripcion: Inscripcion

  @Column({ unique: true })
  codigo: string

  @Column({ type: 'text', nullable: true })
  qr_data: string

  @Column({ nullable: true })
  pdf_url: string

  @Column({ default: false })
  emitida: boolean

  @Column({ type: 'timestamp', nullable: true })
  fecha_emision: Date

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @DeleteDateColumn()
  deletedAt: Date
}
