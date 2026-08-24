import { CertificadosService } from './certificados.service'

describe('CertificadosService', () => {
  it('returns nested certificate data for public validation', async () => {
    const certRepo = {
      findOne: jest.fn().mockResolvedValue({
        codigo: 'CERT-001',
        horas: 20,
        fecha_emision: '2026-08-23T00:00:00.000Z',
        valido: true,
        pdf_url: '/certificados/cert-001.pdf',
        qr_url: '/uploads/qr-cert-001.png',
        inscripcion: {
          curso: { nombre: 'Curso de Prueba' },
          estudiante: { first_name: 'Ana', last_name: 'Lopez' },
        },
      }),
    }

    const service = new CertificadosService(
      certRepo as any,
      {} as any,
      {} as any,
      {} as any,
    )

    const result = await service.validar('CERT-001')

    expect(result).toEqual({
      valido: true,
      certificado: {
        codigo: 'CERT-001',
        horas: 20,
        fecha_emision: '2026-08-23T00:00:00.000Z',
      },
      estudiante: {
        first_name: 'Ana',
        last_name: 'Lopez',
      },
      curso: {
        nombre: 'Curso de Prueba',
      },
      horas: 20,
      fecha_emision: '2026-08-23T00:00:00.000Z',
    })
  })
})
