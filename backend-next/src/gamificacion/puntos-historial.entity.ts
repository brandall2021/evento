import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm'
import { User } from '../users/user.entity.js'

export enum FuentePuntos {
  CHECKIN = 'checkin',
  TRIVIA = 'trivia',
  ENCUESTA = 'encuesta',
  ASISTENCIA = 'asistencia',
  COMENTARIO = 'comentario',
  CERTIFICADO = 'certificado',
  REFERIDO = 'referido',
  BONUS = 'bonus',
}

@Entity('puntos_historial')
export class PuntosHistorial {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  user_id: number

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'user_id' })
  user: User

  @Column()
  puntos: number

  @Column({ type: 'enum', enum: FuentePuntos })
  fuente: FuentePuntos

  @Column({ nullable: true })
  referencia_id: number | null

  @Column({ type: 'text', nullable: true })
  descripcion: string | null

  @CreateDateColumn()
  createdAt: Date
}
