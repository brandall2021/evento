const test = require('node:test')
const assert = require('node:assert/strict')

const {
  buildPublicCertificateValidationPath,
  normalizePublicCertificateValidation,
} = require('./public-certificados')

test('buildPublicCertificateValidationPath trims and encodes the code', () => {
  assert.equal(buildPublicCertificateValidationPath('  CERT 001  '), '/public/certificados/validar/CERT%20001')
})

test('normalizePublicCertificateValidation keeps valid certificate data', () => {
  const result = normalizePublicCertificateValidation({
    valido: true,
    certificado: { codigo: 'CERT-001', horas: 20, fecha_emision: '2026-08-23T00:00:00.000Z' },
    estudiante: { first_name: 'Ana', last_name: 'Lopez' },
    curso: { nombre: 'Curso de Prueba' },
    horas: 20,
    fecha_emision: '2026-08-23T00:00:00.000Z',
  })

  assert.deepEqual(result, {
    valido: true,
    mensaje: null,
    certificado: { codigo: 'CERT-001', horas: 20, fecha_emision: '2026-08-23T00:00:00.000Z' },
    estudiante: { first_name: 'Ana', last_name: 'Lopez' },
    curso: { nombre: 'Curso de Prueba' },
    horas: 20,
    fecha_emision: '2026-08-23T00:00:00.000Z',
  })
})
