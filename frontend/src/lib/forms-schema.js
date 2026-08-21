function normalizeFormSchema(input) {
  if (!input || typeof input !== 'object') {
    return { fields: [] }
  }

  const rawFields = Array.isArray(input.fields) ? input.fields : []
  const fields = rawFields
    .map((field, index) => ({
      id: field.id || field.name || `field-${index}`,
      type: field.type || 'text',
      name: field.name || field.id || `field_${index}`,
      label: field.label || field.name || `Field ${index + 1}`,
      helpText: field.helpText || '',
      placeholder: field.placeholder || '',
      required: !!field.required,
      validation: field.validation || {},
      condition: field.condition || null,
      options: Array.isArray(field.options) ? field.options : [],
      order: Number.isFinite(field.order) ? field.order : index,
    }))
    .sort((a, b) => a.order - b.order)

  return {
    ...input,
    fields,
  }
}

function evaluateVisibleFields(schema, values) {
  const normalized = normalizeFormSchema(schema)

  return normalized.fields.filter((field) => {
    if (!field.condition) return true

    const currentValue = values?.[field.condition.field]
    switch (field.condition.operator || 'equals') {
      case 'notEquals':
        return currentValue !== field.condition.equals
      case 'exists':
        return currentValue !== undefined && currentValue !== null && currentValue !== ''
      case 'notExists':
        return currentValue === undefined || currentValue === null || currentValue === ''
      case 'equals':
      default:
        return currentValue === field.condition.equals
    }
  })
}

module.exports = {
  normalizeFormSchema,
  evaluateVisibleFields,
}
