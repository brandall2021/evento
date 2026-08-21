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
    )

    const result = await service.cursoById(7)

    expect(result?.available_spots).toBe(3)
    expect(result?.is_full).toBe(false)
  })
})
