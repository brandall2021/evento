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
import { Patrocinador } from './patrocinador.entity.js'

export enum TipoBeneficio {
  BANNER = 'banner',
  POPUP = 'popup',
  VIDEO = 'video',
  LOGO_WEB = 'logo_web',
  STAND_VIRTUAL = 'stand_virtual',
  KEYNOTE = 'keynote',
}

@Entity('beneficios_patrocinio')
export class BeneficioPatrocinio {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  patrocinador_id: number

  @ManyToOne(() => Patrocinador, { eager: false })
  @JoinColumn({ name: 'patrocinador_id' })
  patrocinador: Patrocinador

  @Column({ type: 'enum', enum: TipoBeneficio })
  tipo: TipoBeneficio

  @Column()
  titulo: string

  @Column({ type: 'text', nullable: true })
  contenido: string

  @Column({ nullable: true })
  imagen_url: string

  @Column({ nullable: true })
  url: string

  @Column({ default: true })
  activo: boolean

  @Column({ default: 0 })
  orden: number

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @DeleteDateColumn()
  deletedAt: Date
}
