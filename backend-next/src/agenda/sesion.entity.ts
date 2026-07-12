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
import { Bloque } from './bloque.entity.js'
import { Sala } from './sala.entity.js'
import { User } from '../users/user.entity.js'

export enum TipoSesion {
  CONFERENCIA = 'conferencia',
  TALLER = 'taller',
  PANEL = 'panel',
  NETWORKING = 'networking',
  DESCANSO = 'descanso',
  OTRO = 'otro',
}

@Entity('sesiones')
export class Sesion {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  bloque_id: number

  @ManyToOne(() => Bloque, { eager: false })
  @JoinColumn({ name: 'bloque_id' })
  bloque: Bloque

  @Column({ nullable: true })
  sala_id: number

  @ManyToOne(() => Sala, { eager: false })
  @JoinColumn({ name: 'sala_id' })
  sala: Sala

  @Column({ nullable: true })
  ponente_id: number

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'ponente_id' })
  ponente: User

  @Column()
  titulo: string

  @Column({ type: 'text', nullable: true })
  descripcion: string

  @Column({ type: 'enum', enum: TipoSesion, default: TipoSesion.CONFERENCIA })
  tipo: TipoSesion

  @Column({ nullable: true })
  cupos: number

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @DeleteDateColumn()
  deletedAt: Date
}
