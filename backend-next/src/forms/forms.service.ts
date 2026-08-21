import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { FormSubmission } from './form-submission.entity'
import { FormTemplate, FormTemplateStatus } from './form-template.entity'
import { FormTemplateVersion } from './form-template-version.entity'

type FormSchema = Record<string, unknown>

@Injectable()
export class FormsService {
  constructor(
    @InjectRepository(FormTemplate)
    private readonly templateRepo: Repository<FormTemplate>,
    @InjectRepository(FormTemplateVersion)
    private readonly versionRepo: Repository<FormTemplateVersion>,
    @InjectRepository(FormSubmission)
    private readonly submissionRepo: Repository<FormSubmission>,
  ) {}

  findAll() {
    return this.templateRepo.find({ order: { updatedAt: 'DESC' } })
  }

  async findOne(id: number) {
    return this.templateRepo.findOne({ where: { id }, relations: ['published_version', 'versions'] })
  }

  async create(data: { slug: string; name: string; context?: string | null; draft_schema_json?: FormSchema }) {
    const form = this.templateRepo.create({
      slug: data.slug,
      name: data.name,
      context: data.context ?? null,
      status: FormTemplateStatus.DRAFT,
      draft_schema_json: data.draft_schema_json ?? { fields: [] },
      published_version_id: null,
    })

    return this.templateRepo.save(form)
  }

  async updateDraft(id: number, data: { slug?: string; name?: string; context?: string | null; draft_schema_json?: FormSchema }) {
    const form = await this.templateRepo.findOne({ where: { id } })
    if (!form) throw new NotFoundException('Formulario no encontrado')

    if (data.slug !== undefined) form.slug = data.slug
    if (data.name !== undefined) form.name = data.name
    if (data.context !== undefined) form.context = data.context
    if (data.draft_schema_json !== undefined) form.draft_schema_json = data.draft_schema_json

    return this.templateRepo.save(form)
  }

  async publish(id: number) {
    const form = await this.templateRepo.findOne({ where: { id }, relations: ['versions'] })
    if (!form) throw new NotFoundException('Formulario no encontrado')

    const versionNumber = (form.versions?.length || 0) + 1
    const version = this.versionRepo.create({
      form_template_id: form.id,
      version_number: versionNumber,
      schema_json: form.draft_schema_json || { fields: [] },
      published_at: new Date(),
    })

    const savedVersion = await this.versionRepo.save(version)
    form.status = FormTemplateStatus.PUBLISHED
    form.published_version_id = savedVersion.id
    form.published_version = savedVersion
    await this.templateRepo.save(form)

    return form
  }

  async publishedBySlug(slug: string) {
    return this.templateRepo.findOne({
      where: { slug, status: FormTemplateStatus.PUBLISHED },
      relations: ['published_version'],
    })
  }

  async submitBySlug(slug: string, payload: FormSchema, submittedByUserId?: string | null) {
    const form = await this.publishedBySlug(slug)
    if (!form?.published_version) throw new NotFoundException('Formulario no disponible')

    const submission = this.submissionRepo.create({
      form_template_id: form.id,
      form_template_version_id: form.published_version.id,
      payload_json: payload,
      submitted_by_user_id: submittedByUserId ?? null,
    })

    return this.submissionRepo.save(submission)
  }
}
