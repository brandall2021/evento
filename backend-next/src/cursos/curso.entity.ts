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

export enum Modalidad {
  PRESENCIAL = 'presencial',
  VIRTUAL = 'virtual',
  HIBRIDO = 'hibrido',
}

export enum EstadoCurso {
  BORRADOR = 'borrador',
  PUBLICADO = 'publicado',
  FINALIZADO = 'finalizado',
}

@Entity('cursos')
export class Curso {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  nombre: string

  @Column({ type: 'text', nullable: true })
  descripcion: string

  @Column({ nullable: true })
  imagen: string | null

  @Column({ nullable: true })
  categoria: string

  @Column()
  docente_id: number

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'docente_id' })
  docente: User

  @Column({ type: 'date' })
  fecha_inicio: string

  @Column({ type: 'date' })
  fecha_fin: string

  @Column()
  duracion_horas: number

  @Column({ type: 'enum', enum: Modalidad, default: Modalidad.VIRTUAL })
  modalidad: Modalidad

  @Column()
  cupos: number

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  precio: number

  @Column({ type: 'text', nullable: true })
  requisitos: string

  @Column({ default: false })
  aceptacion_auto: boolean

  @Column({ type: 'enum', enum: EstadoCurso, default: EstadoCurso.BORRADOR })
  estado: EstadoCurso

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @DeleteDateColumn()
  deletedAt: Date
}
