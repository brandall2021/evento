import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm'
import { CanalNotificacion } from './notificacion.entity.js'

@Entity('plantillas_notificacion')
export class PlantillaNotificacion {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  nombre: string

  @Column({ type: 'enum', enum: CanalNotificacion })
  canal: CanalNotificacion

  @Column()
  asunto: string

  @Column({ type: 'text' })
  cuerpo: string

  @Column({ type: 'jsonb', nullable: true })
  variables: string[]

  @Column({ default: true })
  activa: boolean

  @CreateDateColumn()
  createdAt: Date
}
