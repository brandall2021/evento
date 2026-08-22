const test = require('node:test')
const assert = require('node:assert/strict')

const { buildProgramAgendaMoveInvalidationKeys } = require('./programa-academico-move')

test('buildProgramAgendaMoveInvalidationKeys targets only the agenda query', () => {
  assert.deepEqual(buildProgramAgendaMoveInvalidationKeys(7), [["programa-academico", 7]])
})
