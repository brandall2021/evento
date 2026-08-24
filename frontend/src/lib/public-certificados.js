function buildPublicCertificateValidationPath(code) {
  return `/public/certificados/validar/${encodeURIComponent(String(code || '').trim())}`
}

function normalizePublicCertificateValidation(data) {
  if (!data) return null

  return {
    valido: Boolean(data.valido),
    mensaje: data.mensaje || null,
    certificado: data.certificado || null,
    estudiante: data.estudiante || null,
    curso: data.curso || null,
    horas: data.horas ?? data.certificado?.horas ?? null,
    fecha_emision: data.fecha_emision ?? data.certificado?.fecha_emision ?? null,
  }
}

module.exports = {
  buildPublicCertificateValidationPath,
  normalizePublicCertificateValidation,
}
