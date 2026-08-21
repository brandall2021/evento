import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm'
import { FormTemplate } from './form-template.entity'

@Entity('form_template_versions')
export class FormTemplateVersion {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  form_template_id: number

  @ManyToOne(() => FormTemplate, (template) => template.versions, { eager: false })
  @JoinColumn({ name: 'form_template_id' })
  template: FormTemplate

  @Column()
  version_number: number

  @Column({ type: 'jsonb' })
  schema_json: Record<string, unknown>

  @Column({ type: 'timestamp', nullable: true })
  published_at: Date | null

  @CreateDateColumn()
  createdAt: Date

  @DeleteDateColumn()
  deletedAt: Date
}
