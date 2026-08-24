import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm'
import { Inscripcion } from '../inscripciones/inscripcion.entity'
import { Sesion } from '../agenda/sesion.entity'
import { Sala } from '../agenda/sala.entity'

export enum MetodoAcreditacion {
  QR = 'qr',
  MANUAL = 'manual',
  GEOLOCATION = 'geolocation',
}

@Entity('checkins')
export class Acreditacion {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  inscripcion_id: number

  @ManyToOne(() => Inscripcion, { eager: false })
  @JoinColumn({ name: 'inscripcion_id' })
  inscripcion: Inscripcion

  @Column({ type: 'int', nullable: true })
  sesion_id: number | null

  @ManyToOne(() => Sesion, { eager: false })
  @JoinColumn({ name: 'sesion_id' })
  sesion: Sesion

  @Column({ type: 'int', nullable: true })
  sala_id: number | null

  @ManyToOne(() => Sala, { eager: false })
  @JoinColumn({ name: 'sala_id' })
  sala: Sala

  @CreateDateColumn()
  timestamp: Date

  @Column({ type: 'enum', enum: MetodoAcreditacion, default: MetodoAcreditacion.QR })
  metodo: MetodoAcreditacion

  @Column({ type: 'varchar', nullable: true })
  device_info: string | null

  @CreateDateColumn()
  createdAt: Date

  @DeleteDateColumn()
  deletedAt: Date
}

export { Acreditacion as Checkin }
export { MetodoAcreditacion as MetodoCheckin }
