import type { CollectionMeta } from "@/lib/event-dashboard"

export type FormTemplateStatus = "draft" | "published" | "archived"

export interface FormTemplateVersion {
  id: number
  form_template_id: number
  version_number: number
  schema_json: Record<string, unknown>
  published_at: string | null
}

export interface FormTemplate {
  id: number
  slug: string
  name: string
  context: string | null
  status: FormTemplateStatus
  draft_schema_json: Record<string, unknown>
  published_version_id: number | null
  published_version?: FormTemplateVersion | null
  versions?: FormTemplateVersion[]
  createdAt: string
  updatedAt: string
}

export interface FormSubmission {
  id: number
  form_template_id: number
  form_template_version_id: number
  payload_json: Record<string, unknown>
  submitted_by_user_id: string | null
  submitted_at: string
}

export interface PaginatedFormTemplates {
  items: FormTemplate[]
  meta?: CollectionMeta
}
