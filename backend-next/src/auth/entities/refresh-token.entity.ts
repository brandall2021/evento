import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm'
import { User } from '../../users/user.entity.js'

@Entity('refresh_tokens', { schema: 'evento' })
export class RefreshToken {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ name: 'user_id', type: 'uuid' })
  user_id: string

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User

  @Index('idx_refresh_tokens_hash')
  @Column({ name: 'token_hash', type: 'varchar', length: 255, unique: true })
  token_hash: string

  @Column({ name: 'expires_at', type: 'timestamptz' })
  expires_at: Date

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  created_at: Date

  @Column({ name: 'revoked_at', type: 'timestamptz', nullable: true })
  revoked_at: Date | null
}
