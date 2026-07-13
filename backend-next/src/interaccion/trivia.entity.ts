import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm'

@Entity('trivias')
export class Trivia {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  curso_id: number

  @Column()
  titulo: string

  @Column({ type: 'text', nullable: true })
  descripcion: string

  @Column({ default: 0 })
  puntos_por_pregunta: number

  @Column({ default: true })
  activa: boolean

  @CreateDateColumn()
  createdAt: Date
}
