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
import { Inscripcion } from '../inscripciones/inscripcion.entity.js'

@Entity('asistencias')
export class Asistencia {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  inscripcion_id: number

  @ManyToOne(() => Inscripcion, { eager: false })
  @JoinColumn({ name: 'inscripcion_id' })
  inscripcion: Inscripcion

  @Column({ type: 'date' })
  fecha: string

  @Column({ default: false })
  presente: boolean

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @DeleteDateColumn()
  deletedAt: Date
}
