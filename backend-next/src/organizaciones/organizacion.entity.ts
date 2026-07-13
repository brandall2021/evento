import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToMany, JoinTable } from 'typeorm'
import { User } from '../users/user.entity.js'

@Entity('organizaciones')
export class Organizacion {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  nombre: string

  @Column({ nullable: true })
  slug: string

  @Column({ nullable: true })
  logo_url: string | null

  @Column({ type: 'text', nullable: true })
  descripcion: string | null

  @Column({ default: true })
  activa: boolean

  @ManyToMany(() => User)
  @JoinTable({ name: 'organizacion_miembros', joinColumn: { name: 'organizacion_id' }, inverseJoinColumn: { name: 'user_id' } })
  miembros: User[]

  @Column({ default: 'gratuita' })
  plan: string

  @Column({ type: 'jsonb', nullable: true })
  configuracion: Record<string, any> | null

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}

@Entity('organizacion_miembros')
export class OrganizacionMiembro {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  organizacion_id: number

  @Column()
  user_id: number

  @Column({ default: 'miembro' })
  rol: string

  @CreateDateColumn()
  joined_at: Date
}
