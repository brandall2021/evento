import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm'
import { Curso } from '../cursos/curso.entity.js'

@Entity('conversaciones')
export class Conversacion {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ nullable: true })
  nombre: string | null

  @Column({ default: false })
  es_grupal: boolean

  @Column({ nullable: true })
  curso_id: number | null

  @ManyToOne(() => Curso, { eager: false })
  @JoinColumn({ name: 'curso_id' })
  curso: Curso

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
