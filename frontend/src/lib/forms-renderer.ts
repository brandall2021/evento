import { evaluateVisibleFields, normalizeFormSchema } from "@/lib/forms-schema"

export function getRenderableFormSchema(schema: unknown) {
  return normalizeFormSchema(schema)
}

export function getVisibleFormFields(schema: unknown, values: Record<string, unknown>) {
  return evaluateVisibleFields(schema, values)
}

export function getFieldRules(field: { type: string; required?: boolean; validation?: { minLength?: number; maxLength?: number; min?: number; max?: number; regex?: string } }) {
  const rules: Record<string, unknown> = {}

  if (field.required) rules.required = "Este campo es obligatorio"
  if (field.validation?.minLength !== undefined) rules.minLength = { value: field.validation.minLength, message: `Mínimo ${field.validation.minLength} caracteres` }
  if (field.validation?.maxLength !== undefined) rules.maxLength = { value: field.validation.maxLength, message: `Máximo ${field.validation.maxLength} caracteres` }
  if (field.validation?.min !== undefined) rules.min = { value: field.validation.min, message: `Mínimo ${field.validation.min}` }
  if (field.validation?.max !== undefined) rules.max = { value: field.validation.max, message: `Máximo ${field.validation.max}` }
  if (field.validation?.regex) rules.pattern = { value: new RegExp(field.validation.regex), message: "Formato inválido" }

  if (field.type === "checkbox") {
    return rules.required ? rules : {}
  }

  return rules
}
