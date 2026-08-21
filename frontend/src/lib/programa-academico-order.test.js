const test = require('node:test')
const assert = require('node:assert/strict')

const { moveOrderedItems } = require('./programa-academico-order')

test('moveOrderedItems swaps adjacent items when moving up', () => {
  const result = moveOrderedItems([
    { id: 1, orden: 1 },
    { id: 2, orden: 2 },
    { id: 3, orden: 3 },
  ], 2, 'up')

  assert.deepEqual(result.map((item) => ({ id: item.id, orden: item.orden })), [
    { id: 2, orden: 1 },
    { id: 1, orden: 2 },
    { id: 3, orden: 3 },
  ])
})

test('moveOrderedItems keeps the list unchanged at the boundaries', () => {
  const result = moveOrderedItems([
    { id: 1, orden: 1 },
    { id: 2, orden: 2 },
  ], 1, 'up')

  assert.deepEqual(result.map((item) => ({ id: item.id, orden: item.orden })), [
    { id: 1, orden: 1 },
    { id: 2, orden: 2 },
  ])
})
