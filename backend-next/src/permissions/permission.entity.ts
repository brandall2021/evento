import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm'

@Entity('permissions')
export class Permission {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  nombre: string

  @Column()
  clave: string

  @Column({ nullable: true })
  descripcion: string | null

  @Column({ default: 'general' })
  categoria: string

  @CreateDateColumn()
  createdAt: Date
}

@Entity('role_permissions')
export class RolePermission {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  rol: string

  @Column()
  permission_id: number
}
