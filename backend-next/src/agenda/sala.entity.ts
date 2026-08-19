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
import { Curso } from '../cursos/curso.entity'

@Entity('salas')
export class Sala {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  curso_id: number

  @ManyToOne(() => Curso, { eager: false })
  @JoinColumn({ name: 'curso_id' })
  curso: Curso

  @Column()
  nombre: string

  @Column({ type: 'int', nullable: true })
  capacidad: number

  @Column({ type: 'varchar', nullable: true })
  ubicacion: string

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @DeleteDateColumn()
  deletedAt: Date
}
