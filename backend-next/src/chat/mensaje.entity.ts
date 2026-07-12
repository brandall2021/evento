import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm'
import { Conversacion } from './conversacion.entity.js'
import { User } from '../users/user.entity.js'

export enum TipoMensaje {
  TEXTO = 'texto',
  IMAGEN = 'imagen',
  ARCHIVO = 'archivo',
  SISTEMA = 'sistema',
}

@Entity('mensajes_chat')
export class MensajeChat {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  conversacion_id: number

  @ManyToOne(() => Conversacion, { eager: false })
  @JoinColumn({ name: 'conversacion_id' })
  conversacion: Conversacion

  @Column()
  remitente_id: number

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'remitente_id' })
  remitente: User

  @Column({ type: 'text' })
  contenido: string

  @Column({ type: 'enum', enum: TipoMensaje, default: TipoMensaje.TEXTO })
  tipo: TipoMensaje

  @CreateDateColumn()
  createdAt: Date
}
