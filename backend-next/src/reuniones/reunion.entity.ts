import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm'
import { User } from '../users/user.entity.js'
import { Curso } from '../cursos/curso.entity.js'

export enum EstadoReunion {
  PROGRAMADA = 'programada',
  EN_CURSO = 'en_curso',
  FINALIZADA = 'finalizada',
  CANCELADA = 'cancelada',
}

@Entity('reuniones')
export class Reunion {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  organizador_id: number

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'organizador_id' })
  organizador: User

  @Column()
  curso_id: number

  @ManyToOne(() => Curso, { eager: false })
  @JoinColumn({ name: 'curso_id' })
  curso: Curso

  @Column()
  titulo: string

  @Column({ type: 'text', nullable: true })
  descripcion: string | null

  @Column({ type: 'timestamp' })
  fecha_inicio: Date

  @Column({ type: 'timestamp' })
  fecha_fin: Date

  @Column({ nullable: true })
  ubicacion: string | null

  @Column({ type: 'enum', enum: EstadoReunion, default: EstadoReunion.PROGRAMADA })
  estado: EstadoReunion

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
