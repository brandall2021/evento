import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { RolesService } from './roles.service.js'
import { Role } from './entities/role.entity.js'
import { RolePermission } from './entities/role-permission.entity.js'
import { PermissionsService } from '../permissions/permissions.service.js'
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
      roleRepo.findOne.mockResolvedValue(null) // no duplicate
      roleRepo.save.mockResolvedValue({ ...mockRole, id: 'role-new' })
      // After save, findOne is called to return full role
      roleRepo.findOne.mockResolvedValueOnce(null).mockResolvedValueOnce({ ...mockRole, id: 'role-new' })

      const result = await service.create(tenantId, { name: 'Editor' })
      expect(result.name).toBe('Editor')
      expect(roleRepo.create).toHaveBeenCalled()
    })

    it('should throw ConflictException for duplicate name', async () => {
      roleRepo.findOne.mockResolvedValue(mockRole)
      await expect(service.create(tenantId, { name: 'Editor' })).rejects.toThrow(ConflictException)
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
    it('should replace all permissions for a role', async () => {
      rpRepo.delete.mockResolvedValue(undefined)
      permService.findByIds.mockResolvedValue([{ id: 'p1' }, { id: 'p2' }])
      rpRepo.save.mockResolvedValue([
        { id: 'rp-1', role_id: 'role-1', permission_id: 'p1' },
        { id: 'rp-2', role_id: 'role-1', permission_id: 'p2' },
      ])

      const result = await service.assignPermissions('role-1', ['p1', 'p2'])
      expect(rpRepo.delete).toHaveBeenCalledWith({ role_id: 'role-1' })
      expect(result).toHaveLength(2)
    })

    it('should throw BadRequestException for invalid permission IDs', async () => {
      rpRepo.delete.mockResolvedValue(undefined)
      permService.findByIds.mockResolvedValue([{ id: 'p1' }]) // only 1 of 2 valid
      await expect(service.assignPermissions('role-1', ['p1', 'bad-id'])).rejects.toThrow(
        BadRequestException,
      )
    })
  })
})
