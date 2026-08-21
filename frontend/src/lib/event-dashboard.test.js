/* eslint-disable @typescript-eslint/no-require-imports */

const test = require('node:test')
const assert = require('node:assert/strict')

const {
  normalizeCollectionResponse,
  formatCurrency,
  formatDateTime,
} = require('./event-dashboard')

test('normalizeCollectionResponse wraps paginated payloads', () => {
  const result = normalizeCollectionResponse({
    data: [{ id: 1 }],
    total: 11,
    page: 2,
    pageSize: 5,
  })

  assert.deepEqual(result.items, [{ id: 1 }])
  assert.deepEqual(result.meta, {
    total: 11,
    page: 2,
    limit: 5,
    totalPages: 3,
  })
})

test('normalizeCollectionResponse leaves arrays unwrapped', () => {
  const result = normalizeCollectionResponse([{ id: 3 }])

  assert.deepEqual(result.items, [{ id: 3 }])
  assert.equal(result.meta, undefined)
})

test('formatCurrency renders pesos with two decimals', () => {
  assert.equal(formatCurrency(1250), '$ 1.250,00')
})

test('formatDateTime renders a human-friendly timestamp', () => {
  assert.match(formatDateTime('2026-08-20T10:15:00Z'), /2026/)
})
