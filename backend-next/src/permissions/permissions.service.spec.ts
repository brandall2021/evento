import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { PermissionsService } from './permissions.service'
import { Permission } from './entities/permission.entity'

describe('PermissionsService', () => {
  let service: PermissionsService
  let repo: {
    find: jest.Mock
    findOne: jest.Mock
    createQueryBuilder: jest.Mock
    manager: { query: jest.Mock }
  }

  const mockPerms: Permission[] = [
    { id: 'u1', code: 'auth.login', module: 'auth', action: 'login', description: 'Iniciar sesión', created_at: new Date() },
    { id: 'u2', code: 'user.read', module: 'users', action: 'read', description: 'Ver usuarios', created_at: new Date() },
    { id: 'u3', code: 'user.create', module: 'users', action: 'create', description: 'Crear usuario', created_at: new Date() },
  ]

  beforeEach(async () => {
    repo = {
      find: jest.fn(),
      findOne: jest.fn(),
      createQueryBuilder: jest.fn(),
      manager: { query: jest.fn() },
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PermissionsService,
        { provide: getRepositoryToken(Permission), useValue: repo },
      ],
    }).compile()

    service = module.get<PermissionsService>(PermissionsService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('findAll', () => {
    it('should return all permissions ordered by module and action', async () => {
      repo.find.mockResolvedValue(mockPerms)
      const result = await service.findAll()
      expect(result).toEqual(mockPerms)
      expect(repo.find).toHaveBeenCalledWith({ order: { module: 'ASC', action: 'ASC' } })
    })
  })

  describe('findByModule', () => {
    it('should return permissions filtered by module', async () => {
      const userPerms = mockPerms.filter(p => p.module === 'users')
      repo.find.mockResolvedValue(userPerms)
      const result = await service.findByModule('users')
      expect(result).toEqual(userPerms)
      expect(repo.find).toHaveBeenCalledWith({ where: { module: 'users' }, order: { action: 'ASC' } })
    })
  })

  describe('findByCodes', () => {
    it('should return permissions matching given codes', async () => {
      const qb = { where: jest.fn().mockReturnThis(), getMany: jest.fn().mockResolvedValue([mockPerms[0]]) }
      repo.createQueryBuilder.mockReturnValue(qb)
      const result = await service.findByCodes(['auth.login'])
      expect(result).toHaveLength(1)
      expect(result[0].code).toBe('auth.login')
    })

    it('should return empty array for empty codes', async () => {
      const result = await service.findByCodes([])
      expect(result).toEqual([])
    })
  })

  describe('tienePermiso', () => {
    it('should return true when role has the permission', async () => {
      repo.findOne.mockResolvedValue(mockPerms[0])
      repo.manager.query.mockResolvedValue([{ 1: 1 }])
      const result = await service.tienePermiso('role-1', 'auth.login')
      expect(result).toBe(true)
    })

    it('should return false when role does not have the permission', async () => {
      repo.findOne.mockResolvedValue(mockPerms[0])
      repo.manager.query.mockResolvedValue([])
      const result = await service.tienePermiso('role-1', 'auth.login')
      expect(result).toBe(false)
    })

    it('should return false when permission code does not exist', async () => {
      repo.findOne.mockResolvedValue(null)
      const result = await service.tienePermiso('role-1', 'nonexistent.code')
      expect(result).toBe(false)
    })
  })
})
