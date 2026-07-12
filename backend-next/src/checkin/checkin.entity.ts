import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm'
import { Inscripcion } from '../inscripciones/inscripcion.entity.js'
import { Sesion } from '../agenda/sesion.entity.js'
import { Sala } from '../agenda/sala.entity.js'

export enum MetodoCheckin {
  QR = 'qr',
  MANUAL = 'manual',
  GEOLOCATION = 'geolocation',
}

@Entity('checkins')
export class Checkin {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  inscripcion_id: number

  @ManyToOne(() => Inscripcion, { eager: false })
  @JoinColumn({ name: 'inscripcion_id' })
  inscripcion: Inscripcion

  @Column({ nullable: true })
  sesion_id: number | null

  @ManyToOne(() => Sesion, { eager: false })
  @JoinColumn({ name: 'sesion_id' })
  sesion: Sesion

  @Column({ nullable: true })
  sala_id: number | null

  @ManyToOne(() => Sala, { eager: false })
  @JoinColumn({ name: 'sala_id' })
  sala: Sala

  @CreateDateColumn()
  timestamp: Date

  @Column({ type: 'enum', enum: MetodoCheckin, default: MetodoCheckin.QR })
  metodo: MetodoCheckin

  @Column({ nullable: true })
  device_info: string | null

  @CreateDateColumn()
  createdAt: Date

  @DeleteDateColumn()
  deletedAt: Date
}
