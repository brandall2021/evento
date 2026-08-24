import { CheckinService } from './checkin.service'
import { EstadoInscripcion } from '../inscripciones/inscripcion.entity'

describe('CheckinService', () => {
  const buildToken = (payload: Record<string, unknown>) => Buffer.from(JSON.stringify(payload)).toString('base64')

  it('returns an accreditation summary when scanning a QR', async () => {
    const inscRepo = {
      findOne: jest.fn().mockResolvedValue({
        id: 5,
        curso_id: 77,
        estado: EstadoInscripcion.ACEPTADO,
        curso: { nombre: 'Congreso 2026' },
        estudiante: { first_name: 'Ana', last_name: 'Lopez' },
      }),
    }
    const checkinRepo = {
      findOne: jest.fn().mockResolvedValue(null),
      create: jest.fn((value) => ({ id: 9, timestamp: new Date('2026-08-23T10:00:00.000Z'), ...value })),
      save: jest.fn(async (value) => value),
    }

    const service = new CheckinService(
      checkinRepo as any,
      inscRepo as any,
      { findOne: jest.fn() } as any,
      { findOne: jest.fn() } as any,
    )

    const result = await service.scanQr(buildToken({ inscripcion_id: 5, curso_id: 77 }))

    expect(result).toEqual({
      valid: true,
      participant: { name: 'Ana Lopez' },
      event: 'Congreso 2026',
      status: 'CHECKED_IN',
    })
  })

  it('returns already checked in when the event accreditation already exists', async () => {
    const inscRepo = {
      findOne: jest.fn().mockResolvedValue({
        id: 5,
        curso_id: 77,
        estado: EstadoInscripcion.ACEPTADO,
        curso: { nombre: 'Congreso 2026' },
        estudiante: { first_name: 'Ana', last_name: 'Lopez' },
      }),
    }
    const checkinRepo = {
      findOne: jest.fn().mockResolvedValue({ id: 9, inscripcion_id: 5 }),
      create: jest.fn(),
      save: jest.fn(),
    }

    const service = new CheckinService(
      checkinRepo as any,
      inscRepo as any,
      { findOne: jest.fn() } as any,
      { findOne: jest.fn() } as any,
    )

    const result = await service.checkinManual(5)

    expect(result).toEqual({
      valid: true,
      already_checked_in: true,
      participant: { name: 'Ana Lopez' },
      event: 'Congreso 2026',
      status: 'ALREADY_CHECKED_IN',
    })
  })
})
