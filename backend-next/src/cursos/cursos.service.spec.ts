import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { CursosService } from './cursos.service.js'
import { Curso, EstadoCurso } from './curso.entity.js'
import { User, UserRole } from '../users/user.entity.js'
import { CacheService } from '../cache/cache.service.js'

describe('CursosService', () => {
  let service: CursosService

  const mockRepo = () => ({
    createQueryBuilder: jest.fn(() => ({
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
      getMany: jest.fn().mockResolvedValue([]),
    })),
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
    findByIds: jest.fn(),
  })

  const mockCache = () => ({
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue(undefined),
    del: jest.fn().mockResolvedValue(undefined),
  })

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CursosService,
        { provide: getRepositoryToken(Curso), useFactory: mockRepo },
        { provide: getRepositoryToken(User), useFactory: mockRepo },
        { provide: CacheService, useFactory: mockCache },
      ],
    }).compile()

    service = module.get<CursosService>(CursosService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('findAll', () => {
    it('should return paginated results', async () => {
      const result = await service.findAll({ id: 1, rol: UserRole.ADMIN }, { page: 1, pageSize: 10 })
      expect(result).toHaveProperty('data')
      expect(result).toHaveProperty('total')
    })

    it('should use cache if available', async () => {
      const mockCache = { data: [{ id: 1 }], total: 1, page: 1, pageSize: 10 }
      const module = await Test.createTestingModule({
        providers: [
          CursosService,
          { provide: getRepositoryToken(Curso), useFactory: mockRepo },
          { provide: getRepositoryToken(User), useFactory: mockRepo },
          { provide: CacheService, useFactory: () => ({ get: jest.fn().mockResolvedValue(mockCache), set: jest.fn(), del: jest.fn() }) },
        ],
      }).compile()
      const svc = module.get<CursosService>(CursosService)
      const result = await svc.findAll({ id: 1, rol: UserRole.ADMIN }, { page: 1, pageSize: 10 })
      expect(result).toEqual(mockCache)
    })
  })

  describe('findById', () => {
    it('should throw NotFoundException for missing curso', async () => {
      const module = await Test.createTestingModule({
        providers: [
          CursosService,
          { provide: getRepositoryToken(Curso), useFactory: () => ({ findOne: jest.fn().mockResolvedValue(null) }) },
          { provide: getRepositoryToken(User), useFactory: mockRepo },
          { provide: CacheService, useFactory: () => ({ get: jest.fn().mockResolvedValue(null), set: jest.fn(), del: jest.fn() }) },
        ],
      }).compile()
      const svc = module.get<CursosService>(CursosService)
      await expect(svc.findById(999)).rejects.toThrow('Curso no encontrado')
    })
  })

  describe('create', () => {
    it('should create a curso', async () => {
      const mockCurso = { id: 1, nombre: 'Test', docente_id: 1 }
      const module = await Test.createTestingModule({
        providers: [
          CursosService,
          { provide: getRepositoryToken(Curso), useFactory: () => ({ create: jest.fn().mockReturnValue(mockCurso), save: jest.fn().mockResolvedValue(mockCurso) }) },
          { provide: getRepositoryToken(User), useFactory: () => ({ findOneBy: jest.fn().mockResolvedValue({ id: 1 }) }) },
          { provide: CacheService, useFactory: () => ({ get: jest.fn(), set: jest.fn(), del: jest.fn() }) },
        ],
      }).compile()
      const svc = module.get<CursosService>(CursosService)
      const result = await svc.create({ nombre: 'Test' }, 1)
      expect(result).toEqual(mockCurso)
    })
  })
})
