import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm'

@Entity('badges')
export class Badge {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  nombre: string

  @Column({ type: 'text', nullable: true })
  descripcion: string

  @Column({ nullable: true })
  imagen_url: string

  @Column({ nullable: true })
  icono: string

  @Column({ default: 0 })
  puntos_requeridos: number

  @Column({ default: true })
  activo: boolean

  @CreateDateColumn()
  createdAt: Date
}
