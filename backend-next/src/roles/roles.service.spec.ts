import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { RolesService } from './roles.service'
import { Role } from './entities/role.entity'
import { RolePermission } from './entities/role-permission.entity'
import { PermissionsService } from '../permissions/permissions.service'
import { ConflictException, NotFoundException, BadRequestException } from '@nestjs/common'

describe('RolesService', () => {
  let service: RolesService
  let roleRepo: {
    find: jest.Mock
    findOne: jest.Mock
    create: jest.Mock
    save: jest.Mock
    remove: jest.Mock
  }
  let rpRepo: {
    find: jest.Mock
    create: jest.Mock
    save: jest.Mock
    delete: jest.Mock
    manager: {
      transaction: jest.Mock
      getRepository: jest.Mock
    }
  }
  let permService: {
    findByIds: jest.Mock
  }

  const tenantId = 'tenant-1'
  const mockRole = {
    id: 'role-1',
    tenant_id: tenantId,
    tenant: { id: tenantId, name: 'Test Tenant', slug: 'test' },
    name: 'Editor',
    description: 'Can edit content',
    is_system: false,
    rolePermissions: [],
    created_at: new Date(),
    updated_at: new Date(),
  } as unknown as Role

  const systemRole = {
    ...mockRole,
    id: 'role-sys',
    name: 'Admin',
    is_system: true,
  } as unknown as Role

  beforeEach(async () => {
    roleRepo = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn((dto: any) => ({ id: 'role-new', ...dto })),
      save: jest.fn((r: any) => Promise.resolve(r)),
      remove: jest.fn(),
    }
    rpRepo = {
      find: jest.fn().mockResolvedValue([]),
      create: jest.fn((dto: any) => ({ id: 'rp-1', ...dto })),
      save: jest.fn((r: any) => Promise.resolve(r)),
      delete: jest.fn(),
      manager: {
        transaction: jest.fn(),
        getRepository: jest.fn(),
      },
    }
    permService = {
      findByIds: jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesService,
        { provide: getRepositoryToken(Role), useValue: roleRepo },
        { provide: getRepositoryToken(RolePermission), useValue: rpRepo },
        { provide: PermissionsService, useValue: permService },
      ],
    }).compile()

    service = module.get<RolesService>(RolesService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('create', () => {
    it('should create a role', async () => {
      roleRepo.findOne
        .mockResolvedValueOnce(null) // no duplicate
        .mockResolvedValueOnce({ ...mockRole, id: 'role-new' }) // after save
      roleRepo.save.mockResolvedValue({ ...mockRole, id: 'role-new' })

      const result = await service.create(tenantId, { name: 'Editor' })
      expect(result.name).toBe('Editor')
      expect(roleRepo.create).toHaveBeenCalled()
    })

    it('should throw ConflictException for duplicate name', async () => {
      roleRepo.findOne.mockResolvedValue(mockRole)
      await expect(service.create(tenantId, { name: 'Editor' })).rejects.toThrow(ConflictException)
    })
  })

  describe('findAll', () => {
    it('should load roles with permissions', async () => {
      roleRepo.find.mockResolvedValue([
        { ...mockRole, rolePermissions: [{ id: 'rp-1', permission: { id: 'p1' } }] },
      ])
      const result = await service.findAll(tenantId)
      expect(roleRepo.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { tenant_id: tenantId },
          relations: ['rolePermissions', 'rolePermissions.permission'],
        }),
      )
      expect(result[0].rolePermissions).toHaveLength(1)
    })
  })

  describe('system role protection', () => {
    it('should block renaming a system role', async () => {
      roleRepo.findOne.mockResolvedValue(systemRole)
      await expect(
        service.update(tenantId, 'role-sys', { name: 'Renamed' }),
      ).rejects.toThrow(BadRequestException)
    })

    it('should block deleting a system role', async () => {
      roleRepo.findOne.mockResolvedValue(systemRole)
      await expect(service.remove(tenantId, 'role-sys')).rejects.toThrow(BadRequestException)
    })
  })

  describe('assignPermissions', () => {
    it('should replace all permissions for a role atomically', async () => {
      roleRepo.findOne.mockResolvedValue(mockRole)
      permService.findByIds.mockResolvedValue([{ id: 'p1' }, { id: 'p2' }])

      const mockRpRepo = {
        create: jest.fn((dto: any) => ({ id: 'rp-new', ...dto })),
        save: jest.fn((r: any) => Promise.resolve(r)),
        delete: jest.fn(),
      }
      rpRepo.manager.getRepository.mockReturnValue(mockRpRepo)
      rpRepo.manager.transaction.mockImplementation(async (fn: any) => fn(rpRepo.manager))

      const result = await service.assignPermissions(tenantId, 'role-1', ['p1', 'p2'])
      expect(rpRepo.manager.transaction).toHaveBeenCalled()
      expect(mockRpRepo.delete).toHaveBeenCalledWith({ role_id: 'role-1' })
    })

    it('should throw BadRequestException for invalid permission IDs', async () => {
      roleRepo.findOne.mockResolvedValue(mockRole)
      permService.findByIds.mockResolvedValue([{ id: 'p1' }])

      const mockRpRepo = {
        delete: jest.fn(),
      }
      rpRepo.manager.getRepository.mockReturnValue(mockRpRepo)
      rpRepo.manager.transaction.mockImplementation(async (fn: any) => fn(rpRepo.manager))

      await expect(
        service.assignPermissions(tenantId, 'role-1', ['p1', 'bad-id']),
      ).rejects.toThrow(BadRequestException)
    })

    it('should throw NotFoundException if role not found in tenant', async () => {
      roleRepo.findOne.mockResolvedValue(null)
      await expect(
        service.assignPermissions(tenantId, 'role-999', ['p1']),
      ).rejects.toThrow(NotFoundException)
    })

    it('should block modifying permissions of a system role', async () => {
      roleRepo.findOne.mockResolvedValue(systemRole)
      await expect(
        service.assignPermissions(tenantId, 'role-sys', ['p1']),
      ).rejects.toThrow(BadRequestException)
    })

    it('should clear all permissions when empty array passed', async () => {
      roleRepo.findOne.mockResolvedValue(mockRole)

      const mockRpRepo = {
        delete: jest.fn(),
      }
      rpRepo.manager.getRepository.mockReturnValue(mockRpRepo)
      rpRepo.manager.transaction.mockImplementation(async (fn: any) => fn(rpRepo.manager))

      const result = await service.assignPermissions(tenantId, 'role-1', [])
      expect(result).toEqual([])
    })
  })
})
