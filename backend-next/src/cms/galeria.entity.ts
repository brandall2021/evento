import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
} from 'typeorm'

export enum TipoMedia {
  IMAGEN = 'imagen',
  VIDEO = 'video',
  DOCUMENTO = 'documento',
}

@Entity('galeria')
export class Galeria {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ nullable: true })
  curso_id: number

  @Column()
  titulo: string

  @Column({ type: 'text', nullable: true })
  descripcion: string

  @Column()
  url: string

  @Column({ nullable: true })
  thumbnail_url: string

  @Column({ type: 'enum', enum: TipoMedia, default: TipoMedia.IMAGEN })
  tipo: TipoMedia

  @Column({ default: 0 })
  orden: number

  @CreateDateColumn()
  createdAt: Date

  @DeleteDateColumn()
  deletedAt: Date
}
