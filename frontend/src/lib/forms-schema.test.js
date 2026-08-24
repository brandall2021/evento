const test = require('node:test')
const assert = require('node:assert/strict')

const { normalizeFormSchema, evaluateVisibleFields } = require('./forms-schema')

test('normalizeFormSchema preserves field order', () => {
  const schema = normalizeFormSchema({
    fields: [
      { id: 'email', name: 'email', label: 'Email', order: 2 },
      { id: 'first_name', name: 'first_name', label: 'Nombre', order: 1 },
    ],
  })

  assert.equal(schema.fields[0].name, 'first_name')
  assert.equal(schema.fields[1].name, 'email')
})

test('evaluateVisibleFields hides conditional fields until values match', () => {
  const schema = normalizeFormSchema({
    fields: [
      { id: 'attending', name: 'attending', label: 'Asistirá', type: 'checkbox', order: 1 },
      {
        id: 'company',
        name: 'company',
        label: 'Empresa',
        type: 'text',
        order: 2,
        condition: { field: 'attending', equals: true },
      },
    ],
  })

  assert.deepEqual(evaluateVisibleFields(schema, { attending: false }).map((field) => field.name), ['attending'])
  assert.deepEqual(evaluateVisibleFields(schema, { attending: true }).map((field) => field.name), ['attending', 'company'])
})
