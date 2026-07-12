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
import { DiaAgenda } from './dia.entity.js'

@Entity('bloques')
export class Bloque {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  dia_id: number

  @ManyToOne(() => DiaAgenda, { eager: false })
  @JoinColumn({ name: 'dia_id' })
  dia: DiaAgenda

  @Column()
  titulo: string

  @Column({ type: 'time' })
  hora_inicio: string

  @Column({ type: 'time' })
  hora_fin: string

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @DeleteDateColumn()
  deletedAt: Date
}
