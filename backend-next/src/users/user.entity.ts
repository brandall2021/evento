import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm'
import * as bcrypt from 'bcryptjs'

export enum UserRole {
  ADMIN = 'admin',
  ORGANIZER = 'organizador',
  COORDINATOR = 'coordinador',
  SPEAKER = 'ponente',
  EXHIBITOR = 'expositor',
  SPONSOR = 'patrocinador',
  ATTENDEE = 'asistente',
  GUEST = 'invitado',
  CHECKIN = 'checkin',
  MODERATOR = 'moderador',
  DOCENTE = 'docente',
  ESTUDIANTE = 'estudiante',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  nombre: string

  @Column({ unique: true })
  email: string

  @Column({ select: false })
  password: string

  @Column({ type: 'enum', enum: UserRole, default: UserRole.ATTENDEE })
  rol: UserRole

  @Column({ nullable: true })
  telefono: string

  @Column({ nullable: true })
  avatar: string

  @Column({ default: true })
  activo: boolean

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @DeleteDateColumn()
  deletedAt: Date

  async comparePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password)
  }
}
