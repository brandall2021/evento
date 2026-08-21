/* eslint-disable @typescript-eslint/no-require-imports */

const test = require('node:test')
const assert = require('node:assert/strict')

const { buildGuestEnrollmentPayload } = require('./event-enrollment')

test('buildGuestEnrollmentPayload returns auth payload and course id', () => {
  const result = buildGuestEnrollmentPayload({
    courseId: '7',
    firstName: 'Ana',
    lastName: 'Lopez',
    email: 'ana@example.com',
    password: 'Secret123!',
    confirmPassword: 'Secret123!',
  })

  assert.deepEqual(result.authPayload, {
    firstName: 'Ana',
    lastName: 'Lopez',
    email: 'ana@example.com',
    password: 'Secret123!',
  })
  assert.equal(result.courseId, 7)
})

test('buildGuestEnrollmentPayload rejects mismatched passwords', () => {
  assert.throws(() =>
    buildGuestEnrollmentPayload({
      courseId: '7',
      firstName: 'Ana',
      lastName: 'Lopez',
      email: 'ana@example.com',
      password: 'Secret123!',
      confirmPassword: 'Secret456!',
    }), /Las contraseñas no coinciden/
  )
})
