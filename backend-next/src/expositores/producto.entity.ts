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
import { Expositor } from './expositor.entity.js'

@Entity('productos_expositor')
export class ProductoExpositor {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  expositor_id: number

  @ManyToOne(() => Expositor, { eager: false })
  @JoinColumn({ name: 'expositor_id' })
  expositor: Expositor

  @Column()
  nombre: string

  @Column({ type: 'text', nullable: true })
  descripcion: string

  @Column({ nullable: true })
  imagen_url: string

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  precio: number

  @Column({ nullable: true })
  url_externa: string

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @DeleteDateColumn()
  deletedAt: Date
}
