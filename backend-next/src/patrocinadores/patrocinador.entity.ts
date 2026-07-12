import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm'
import { User } from '../users/user.entity.js'
import { Curso } from '../cursos/curso.entity.js'

export enum CategoriaPatrocinio {
  PLATINO = 'platino',
  ORO = 'oro',
  PLATA = 'plata',
  BRONCE = 'bronce',
}

@Entity('patrocinadores')
export class Patrocinador {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  user_id: number

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'user_id' })
  user: User

  @Column()
  curso_id: number

  @ManyToOne(() => Curso, { eager: false })
  @JoinColumn({ name: 'curso_id' })
  curso: Curso

  @Column()
  empresa: string

  @Column({ type: 'enum', enum: CategoriaPatrocinio, default: CategoriaPatrocinio.BRONCE })
  categoria: CategoriaPatrocinio

  @Column({ nullable: true })
  logo_url: string

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  monto: number

  @Column({ nullable: true })
  contacto_nombre: string

  @Column({ nullable: true })
  contacto_email: string

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @DeleteDateColumn()
  deletedAt: Date
}
