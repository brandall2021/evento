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

  it('returns a program overview for the course', async () => {
    const diaRepo = service['diaRepo'] as any
    const bloqueRepo = service['bloqueRepo'] as any
    const sesionRepo = service['sesionRepo'] as any

    diaRepo.find.mockResolvedValue([{ id: 1, curso_id: 7, fecha: '2026-08-20', titulo: 'Día 1', orden: 1 }])
    bloqueRepo.find.mockResolvedValue([{ id: 11, dia_id: 1, titulo: 'Bloque 1', hora_inicio: '09:00', hora_fin: '10:00' }])
    sesionRepo.find.mockResolvedValue([{ id: 21, bloque_id: 11, titulo: 'Sesión 1' }])

    const result = await service.programaAcademico(7)

    expect(result[0].bloques[0].sesiones[0].titulo).toBe('Sesión 1')
  })
})
