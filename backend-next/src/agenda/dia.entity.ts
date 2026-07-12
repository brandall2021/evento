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
import { Curso } from '../cursos/curso.entity.js'

@Entity('dias_agenda')
export class DiaAgenda {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  curso_id: number

  @ManyToOne(() => Curso, { eager: false })
  @JoinColumn({ name: 'curso_id' })
  curso: Curso

  @Column({ type: 'date' })
  fecha: string

  @Column()
  titulo: string

  @Column({ default: 0 })
  orden: number

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @DeleteDateColumn()
  deletedAt: Date
}
