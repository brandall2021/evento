import { PublicApiService } from './public-api.service'

describe('PublicApiService', () => {
  it('adds availability metadata to a published course', async () => {
    const cursoRepo = {
      findOne: jest.fn().mockResolvedValue({ id: 7, nombre: 'Curso', cupos: 10 }),
      findAndCount: jest.fn(),
    }
    const service = new PublicApiService(
      cursoRepo as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      { count: jest.fn().mockResolvedValue(7) } as any,
      { get: jest.fn(), set: jest.fn() } as any,
      { publishedBySlug: jest.fn(), submitBySlug: jest.fn() } as any,
      { find: jest.fn() } as any,
      { find: jest.fn() } as any,
      { find: jest.fn() } as any,
    )

    const result = await service.cursoById(7)

    expect(result?.available_spots).toBe(3)
    expect(result?.is_full).toBe(false)
  })

  it('includes the public agenda in the course detail', async () => {
    const cursoRepo = {
      findOne: jest.fn().mockResolvedValue({ id: 7, nombre: 'Curso', cupos: 10 }),
      findAndCount: jest.fn(),
    }
    const diaRepo = {
      find: jest.fn().mockResolvedValue([{ id: 1, curso_id: 7, fecha: '2026-08-20', titulo: 'Día 1', orden: 1 }]),
    }
    const bloqueRepo = {
      find: jest.fn().mockResolvedValue([{ id: 11, dia_id: 1, titulo: 'Bloque 1', hora_inicio: '09:00', hora_fin: '10:00', orden: 1 }]),
    }
    const sesionRepo = {
      find: jest.fn().mockResolvedValue([{ id: 21, bloque_id: 11, titulo: 'Sesión 1', orden: 1 }]),
    }
    const service = new PublicApiService(
      cursoRepo as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      { count: jest.fn().mockResolvedValue(7) } as any,
      { get: jest.fn(), set: jest.fn() } as any,
      { publishedBySlug: jest.fn(), submitBySlug: jest.fn() } as any,
      diaRepo as any,
      bloqueRepo as any,
      sesionRepo as any,
    )

    const result = await service.cursoById(7)

    expect(result?.agenda?.[0]?.bloques?.[0]?.sesiones?.[0]?.titulo).toBe('Sesión 1')
  })
})
