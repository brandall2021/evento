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

export enum EstadoInscripcion {
  PENDIENTE = 'pendiente',
  ACEPTADO = 'aceptado',
  RECHAZADO = 'rechazado',
  EN_CURSO = 'en_curso',
  FINALIZADO = 'finalizado',
}

@Entity('inscripciones')
export class Inscripcion {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  estudiante_id: number

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'estudiante_id' })
  estudiante: User

  @Column()
  curso_id: number

  @ManyToOne(() => Curso, { eager: false })
  @JoinColumn({ name: 'curso_id' })
  curso: Curso

  @Column({ type: 'enum', enum: EstadoInscripcion, default: EstadoInscripcion.PENDIENTE })
  estado: EstadoInscripcion

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fecha_solicitud: Date

  @Column({ type: 'timestamp', nullable: true })
  fecha_aceptacion: Date | null

  @Column({ type: 'timestamp', nullable: true })
  fecha_rechazo: Date | null

  @Column({ type: 'text', nullable: true })
  motivo_rechazo: string

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @DeleteDateColumn()
  deletedAt: Date
}
