import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { AnalyticsService } from './analytics.service.js'
import { User } from '../users/user.entity.js'
import { Curso, EstadoCurso } from '../cursos/curso.entity.js'
import { Inscripcion, EstadoInscripcion } from '../inscripciones/inscripcion.entity.js'
import { Pago, EstadoPago } from '../pagos/pago.entity.js'
import { Asistencia } from '../asistencias/asistencia.entity.js'
import { Certificado } from '../certificados/certificado.entity.js'

describe('AnalyticsService', () => {
  let service: AnalyticsService

  const mockRepo = () => ({
    count: jest.fn().mockResolvedValue(0),
    find: jest.fn().mockResolvedValue([]),
    createQueryBuilder: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getRawMany: jest.fn().mockResolvedValue([]),
      getRawOne: jest.fn().mockResolvedValue({ total: '0', presentes: '0' }),
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([]),
      leftJoin: jest.fn().mockReturnThis(),
      getCount: jest.fn().mockResolvedValue(0),
    })),
  })

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        { provide: getRepositoryToken(User), useFactory: mockRepo },
        { provide: getRepositoryToken(Curso), useFactory: mockRepo },
        { provide: getRepositoryToken(Inscripcion), useFactory: mockRepo },
        { provide: getRepositoryToken(Pago), useFactory: mockRepo },
        { provide: getRepositoryToken(Asistencia), useFactory: mockRepo },
        { provide: getRepositoryToken(Certificado), useFactory: mockRepo },
      ],
    }).compile()

    service = module.get<AnalyticsService>(AnalyticsService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('dashboard', () => {
    it('should return dashboard stats', async () => {
      const result = await service.dashboard()
      expect(result).toHaveProperty('usuarios')
      expect(result).toHaveProperty('cursos')
      expect(result).toHaveProperty('inscripciones')
      expect(result).toHaveProperty('pagos')
      expect(result).toHaveProperty('certificados')
      expect(result).toHaveProperty('asistencias')
    })
  })

  describe('cursosPorEstado', () => {
    it('should return counts by state', async () => {
      const result = await service.cursosPorEstado()
      expect(result).toHaveProperty('borrador')
      expect(result).toHaveProperty('publicado')
      expect(result).toHaveProperty('finalizado')
    })
  })
})
