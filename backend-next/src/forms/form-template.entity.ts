import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm'
import { FormTemplateVersion } from './form-template-version.entity'

export enum FormTemplateStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

@Entity('form_templates')
export class FormTemplate {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ unique: true })
  slug: string

  @Column()
  name: string

  @Column({ type: 'varchar', nullable: true })
  context: string | null

  @Column({ type: 'enum', enum: FormTemplateStatus, default: FormTemplateStatus.DRAFT })
  status: FormTemplateStatus

  @Column({ type: 'jsonb', default: {} })
  draft_schema_json: Record<string, unknown>

  @Column({ type: 'int', nullable: true })
  published_version_id: number | null

  @OneToOne(() => FormTemplateVersion, { nullable: true, eager: false })
  @JoinColumn({ name: 'published_version_id' })
  published_version: FormTemplateVersion | null

  @OneToMany(() => FormTemplateVersion, (version) => version.template)
  versions: FormTemplateVersion[]

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @DeleteDateColumn()
  deletedAt: Date
}
