export interface FormFieldValidation {
  minLength?: number
  maxLength?: number
  min?: number
  max?: number
  regex?: string
}

export interface FormFieldCondition {
  field: string
  operator?: 'equals' | 'notEquals' | 'exists' | 'notExists'
  equals?: string | number | boolean
}

export interface FormFieldOption {
  label: string
  value: string
}

export interface FormFieldSchema {
  id: string
  type: string
  name: string
  label: string
  helpText?: string
  placeholder?: string
  required?: boolean
  validation?: FormFieldValidation
  condition?: FormFieldCondition | null
  options?: FormFieldOption[]
  order?: number
}

export interface FormSchema {
  fields: FormFieldSchema[]
  [key: string]: unknown
}

export function normalizeFormSchema(input: unknown): FormSchema
export function evaluateVisibleFields(schema: unknown, values?: Record<string, unknown>): FormFieldSchema[]
