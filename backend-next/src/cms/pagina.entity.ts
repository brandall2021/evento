import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm'

export enum TipoPagina {
  INICIO = 'inicio',
  SOBRE = 'sobre',
  CONTACTO = 'contacto',
  CUSTOM = 'custom',
}

@Entity('paginas')
export class Pagina {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ unique: true })
  slug: string

  @Column()
  titulo: string

  @Column({ type: 'text', nullable: true })
  contenido: string

  @Column({ type: 'text', nullable: true })
  meta_title: string

  @Column({ type: 'text', nullable: true })
  meta_description: string

  @Column({ type: 'enum', enum: TipoPagina, default: TipoPagina.CUSTOM })
  tipo: TipoPagina

  @Column({ default: true })
  publica: boolean

  @Column({ default: 0 })
  orden: number

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @DeleteDateColumn()
  deletedAt: Date
}
