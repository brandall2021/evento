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

export enum MetodoPago {
  MERCADO_PAGO = 'mercado_pago',
  TRANSFERENCIA = 'transferencia',
  TARJETA = 'tarjeta',
  PAYPAL = 'paypal',
}

export enum EstadoPago {
  PENDIENTE = 'pendiente',
  PAGADO = 'pagado',
  RECHAZADO = 'rechazado',
  VENCIDO = 'vencido',
}

@Entity('pagos')
export class Pago {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  inscripcion_id: number

  @ManyToOne(() => Inscripcion, { eager: false })
  @JoinColumn({ name: 'inscripcion_id' })
  inscripcion: Inscripcion

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  monto: number

  @Column({ type: 'enum', enum: MetodoPago })
  metodo: MetodoPago

  @Column({ type: 'enum', enum: EstadoPago, default: EstadoPago.PENDIENTE })
  estado: EstadoPago

  @Column({ type: 'timestamp', nullable: true })
  fecha_pago: Date

  @Column({ nullable: true })
  codigo_transaccion: string

  @Column({ nullable: true })
  comprobante: string

  @Column({ default: 1 })
  cuota_numero: number

  @Column({ default: 1 })
  cuota_total: number

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  descuento: number

  @Column({ nullable: true })
  tipo_beca: string

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @DeleteDateColumn()
  deletedAt: Date
}
