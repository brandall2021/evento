import { CertificadosService } from './certificados.service'

describe('CertificadosService', () => {
  it('issues sequential certificate codes from the database sequence', async () => {
    const certRepo = {
      findOne: jest.fn().mockResolvedValueOnce(null),
      create: jest.fn((value) => value),
      save: jest.fn(async (value) => value),
    }
    const inscRepo = {
      findOne: jest.fn().mockResolvedValue({
        id: 123,
        estado: 'finalizado',
        curso: { duracion_horas: 20 },
        estudiante: { first_name: 'Ana', last_name: 'Lopez' },
      }),
      save: jest.fn(),
    }
    const dataSource = {
      query: jest.fn().mockResolvedValue([{ numero: '1' }]),
    }

    const service = new CertificadosService(
      certRepo as any,
      inscRepo as any,
      { count: jest.fn().mockResolvedValue(10) } as any,
      { findOne: jest.fn() } as any,
      dataSource as any,
    )

    const result = await service.emitir(123)

    expect(result.codigo).toBe('2026-000001')
  })

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
