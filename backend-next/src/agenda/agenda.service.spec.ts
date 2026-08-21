import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { AgendaService } from './agenda.service'
import { DiaAgenda } from './dia.entity'
import { Sala } from './sala.entity'
import { Bloque } from './bloque.entity'
import { Sesion } from './sesion.entity'

describe('AgendaService', () => {
  let service: AgendaService

  const mockRepo = () => ({
    findOneBy: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  })

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AgendaService,
        { provide: getRepositoryToken(DiaAgenda), useFactory: mockRepo },
        { provide: getRepositoryToken(Sala), useFactory: mockRepo },
        { provide: getRepositoryToken(Bloque), useFactory: mockRepo },
        { provide: getRepositoryToken(Sesion), useFactory: mockRepo },
      ],
    }).compile()

    service = module.get<AgendaService>(AgendaService)
  })

  it('returns blocks ordered by orden inside the program overview', async () => {
    const diaRepo = service['diaRepo'] as any
    const bloqueRepo = service['bloqueRepo'] as any
    const sesionRepo = service['sesionRepo'] as any

    diaRepo.find.mockResolvedValue([{ id: 1, curso_id: 7, fecha: '2026-08-20', titulo: 'Día 1', orden: 1 }])
    bloqueRepo.find.mockResolvedValue([])
    sesionRepo.find.mockResolvedValue([{ id: 21, bloque_id: 11, titulo: 'Sesión 1' }])

    const result = await service.programaAcademico(7)

    expect(bloqueRepo.find).toHaveBeenCalledWith({
      where: { dia_id: 1 },
      order: { orden: 'ASC', hora_inicio: 'ASC' },
    })
    expect(result[0].bloques).toEqual([])
  })
})
