import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm'
import { SalaStreaming } from './sala-streaming.entity.js'

@Entity('encuestas_streaming')
export class EncuestaStreaming {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  sala_streaming_id: number

  @ManyToOne(() => SalaStreaming, { eager: false })
  @JoinColumn({ name: 'sala_streaming_id' })
  sala_streaming: SalaStreaming

  @Column()
  titulo: string

  @Column({ type: 'jsonb' })
  opciones: string[]

  @Column({ default: true })
  activa: boolean

  @CreateDateColumn()
  createdAt: Date
}
