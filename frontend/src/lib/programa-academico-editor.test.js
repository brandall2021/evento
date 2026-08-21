const test = require('node:test')
const assert = require('node:assert/strict')

const { getProgramEditorMeta } = require('./programa-academico-editor')

test('getProgramEditorMeta returns the day panel copy', () => {
  const meta = getProgramEditorMeta('day')

  assert.equal(meta.title, 'Editar día')
  assert.equal(meta.description, 'Ajusta el título, fecha u orden del día.')
  assert.equal(meta.submitLabel, 'Guardar día')
})
