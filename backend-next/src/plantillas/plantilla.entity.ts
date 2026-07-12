import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm'

@Entity('plantillas_certificado')
export class PlantillaCertificado {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  nombre: string

  @Column({ type: 'jsonb', default: {} })
  config: Record<string, any>

  @Column({ nullable: true })
  firma_url: string | null

  @Column({ nullable: true })
  logo_url: string | null

  @Column({ default: false })
  is_default: boolean

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @DeleteDateColumn()
  deletedAt: Date
}
