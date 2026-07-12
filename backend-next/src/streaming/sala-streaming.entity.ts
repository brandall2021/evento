import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm'
import { Curso } from '../cursos/curso.entity.js'
import { Sesion } from '../agenda/sesion.entity.js'

export enum PlataformaStream {
  ZOOM = 'zoom',
  TEAMS = 'teams',
  YOUTUBE = 'youtube',
  RTMP = 'rtmp',
  WEBRTC = 'webrtc',
}

@Entity('salas_streaming')
export class SalaStreaming {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  curso_id: number

  @ManyToOne(() => Curso, { eager: false })
  @JoinColumn({ name: 'curso_id' })
  curso: Curso

  @Column({ nullable: true })
  sesion_id: number | null

  @ManyToOne(() => Sesion, { eager: false })
  @JoinColumn({ name: 'sesion_id' })
  sesion: Sesion

  @Column()
  titulo: string

  @Column({ type: 'enum', enum: PlataformaStream })
  plataforma: PlataformaStream

  @Column({ nullable: true })
  url_stream: string | null

  @Column({ nullable: true })
  url_chat: string | null

  @Column({ default: true })
  activa: boolean

  @Column({ type: 'timestamp', nullable: true })
  fecha_inicio: Date | null

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
