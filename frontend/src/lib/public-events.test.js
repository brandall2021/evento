/* eslint-disable @typescript-eslint/no-require-imports */

const test = require('node:test')
const assert = require('node:assert/strict')

const {
  normalizePublicEventCollection,
  getEventTypeLabel,
  formatPublicEventDateRange,
  getAvailabilityLabel,
  getEnrollmentActionLabel,
} = require('./public-events')

test('normalizePublicEventCollection extracts items and pagination', () => {
  const result = normalizePublicEventCollection({
    items: [{ id: 1 }],
    total: 14,
    page: 2,
    pageSize: 7,
  })

  assert.deepEqual(result.items, [{ id: 1 }])
  assert.deepEqual(result.meta, {
    total: 14,
    page: 2,
    limit: 7,
    totalPages: 2,
  })
})

test('getEventTypeLabel maps course modes to display labels', () => {
  assert.equal(getEventTypeLabel('virtual'), 'Virtual')
  assert.equal(getEventTypeLabel('hibrido'), 'Híbrido')
})

test('formatPublicEventDateRange formats a readable date range', () => {
  assert.match(formatPublicEventDateRange('2026-08-20', '2026-08-22'), /2026/)
})

test('getAvailabilityLabel maps availability state', () => {
  assert.equal(getAvailabilityLabel({ available_spots: 5, cupos: 10 }), 'Cupos disponibles')
  assert.equal(getAvailabilityLabel({ available_spots: 0, cupos: 10 }), 'Sin cupos')
})

test('getEnrollmentActionLabel maps availability state', () => {
  assert.equal(getEnrollmentActionLabel({ available_spots: 4, cupos: 10 }), 'Inscribirme')
  assert.equal(getEnrollmentActionLabel({ available_spots: 0, cupos: 10 }), 'Sumarme a lista de espera')
})
