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
import { Inscripcion } from '../inscripciones/inscripcion.entity.js'

@Entity('certificados')
export class Certificado {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  inscripcion_id: number

  @OneToOne(() => Inscripcion, { eager: false })
  @JoinColumn({ name: 'inscripcion_id' })
  inscripcion: Inscripcion

  @Column({ unique: true })
  codigo: string

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fecha_emision: Date

  @Column()
  horas: number

  @Column({ type: 'decimal', precision: 4, scale: 2, nullable: true })
  nota: number | null

  @Column({ nullable: true })
  pdf_url: string

  @Column({ nullable: true })
  qr_url: string

  @Column({ default: true })
  valido: boolean

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @DeleteDateColumn()
  deletedAt: Date
}
