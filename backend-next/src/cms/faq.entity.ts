import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm'

@Entity('faqs')
export class FAQ {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ nullable: true })
  curso_id: number

  @Column()
  pregunta: string

  @Column({ type: 'text' })
  respuesta: string

  @Column({ default: 0 })
  orden: number

  @Column({ default: true })
  activo: boolean

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @DeleteDateColumn()
  deletedAt: Date
}
