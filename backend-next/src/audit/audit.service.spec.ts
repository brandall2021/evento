import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { AuditService } from './audit.service'
import { AuditLog, AuditAction } from './entities/audit-log.entity'

describe('AuditService', () => {
  let service: AuditService
  let repo: {
    create: jest.Mock
    save: jest.Mock
    find: jest.Mock
  }

  beforeEach(async () => {
    repo = {
      create: jest.fn((dto: any) => ({ id: 'uuid-1', created_at: new Date(), ...dto })),
      save: jest.fn((entry: any) => Promise.resolve(entry)),
      find: jest.fn().mockResolvedValue([]),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditService,
        { provide: getRepositoryToken(AuditLog), useValue: repo },
      ],
    }).compile()

    service = module.get<AuditService>(AuditService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('log', () => {
    it('should create and save an audit log entry', async () => {
      const data = {
        tenant_id: 'tenant-1',
        user_id: 'user-1',
        action: AuditAction.CREATE,
        entity: 'users',
        entity_id: 'user-2',
        new_values: { email: 'test@example.com' },
      }
      const result = await service.log(data)
      expect(result).toHaveProperty('id', 'uuid-1')
      expect(result.action).toBe(AuditAction.CREATE)
      expect(repo.create).toHaveBeenCalledWith(data)
      expect(repo.save).toHaveBeenCalled()
    })
  })

  describe('findByEntity', () => {
    it('should return audit logs for a given entity', async () => {
      const mockLogs = [
        { id: '1', entity: 'cursos', entity_id: 'curso-1', action: AuditAction.UPDATE },
        { id: '2', entity: 'cursos', entity_id: 'curso-1', action: AuditAction.CREATE },
      ]
      repo.find.mockResolvedValue(mockLogs)

      const result = await service.findByEntity('cursos', 'curso-1')
      expect(result).toEqual(mockLogs)
      expect(repo.find).toHaveBeenCalledWith({
        where: { entity: 'cursos', entity_id: 'curso-1' },
        order: { created_at: 'DESC' },
        take: 100,
      })
    })

    it('should query without entity_id when not provided', async () => {
      repo.find.mockResolvedValue([])
      await service.findByEntity('cursos')
      expect(repo.find).toHaveBeenCalledWith({
        where: { entity: 'cursos' },
        order: { created_at: 'DESC' },
        take: 100,
      })
    })
  })

  describe('findByUser', () => {
    it('should return audit logs for a given user', async () => {
      const mockLogs = [
        { id: '1', user_id: 'user-1', action: AuditAction.LOGIN },
      ]
      repo.find.mockResolvedValue(mockLogs)

      const result = await service.findByUser('user-1')
      expect(result).toEqual(mockLogs)
      expect(repo.find).toHaveBeenCalledWith({
        where: { user_id: 'user-1' },
        order: { created_at: 'DESC' },
        take: 100,
      })
    })
  })
})
