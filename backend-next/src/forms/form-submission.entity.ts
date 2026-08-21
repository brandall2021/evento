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
import { FormTemplateVersion } from './form-template-version.entity'

@Entity('form_submissions')
export class FormSubmission {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  form_template_id: number

  @ManyToOne(() => FormTemplate, { eager: false })
  @JoinColumn({ name: 'form_template_id' })
  template: FormTemplate

  @Column()
  form_template_version_id: number

  @ManyToOne(() => FormTemplateVersion, { eager: false })
  @JoinColumn({ name: 'form_template_version_id' })
  version: FormTemplateVersion

  @Column({ type: 'jsonb' })
  payload_json: Record<string, unknown>

  @Column({ type: 'varchar', nullable: true })
  submitted_by_user_id: string | null

  @CreateDateColumn()
  submitted_at: Date

  @DeleteDateColumn()
  deletedAt: Date
}
