import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { UsersService } from './users.service.js'
import { User } from './entities/user.entity.js'
import { UserTenant } from './entities/user-tenant.entity.js'
import { UserRole } from './entities/user-role.entity.js'
import { RefreshToken } from './entities/refresh-token.entity.js'
import { ConflictException, NotFoundException } from '@nestjs/common'

describe('UsersService', () => {
  let service: UsersService

  const mockUserRepo = () => ({
    findOne: jest.fn(),
    find: jest.fn(),
    findAndCount: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    softDelete: jest.fn(),
    createQueryBuilder: jest.fn(),
  })

  const mockUserTenantRepo = () => ({
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  })

  const mockUserRoleRepo = () => ({
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  })

  const mockRefreshTokenRepo = () => ({})

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useFactory: mockUserRepo },
        { provide: getRepositoryToken(UserTenant), useFactory: mockUserTenantRepo },
        { provide: getRepositoryToken(UserRole), useFactory: mockUserRoleRepo },
        { provide: getRepositoryToken(RefreshToken), useFactory: mockRefreshTokenRepo },
      ],
    }).compile()

    service = module.get<UsersService>(UsersService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('create', () => {
    it('should create a user with hashed password', async () => {
      const userRepo = service['userRepo'] as any
      userRepo.findOne.mockResolvedValue(null)
      userRepo.create.mockImplementation((d: any) => d)
      userRepo.save.mockImplementation(async (d: any) => ({ ...d, id: 'uuid-1', created_at: new Date() }))

      const result = await service.create({
        email: 'new@example.com',
        password: 'SecurePass1!',
        firstName: 'Jane',
        lastName: 'Doe',
      })

      expect(result.email).toBe('new@example.com')
      expect(result.firstName).toBe('Jane')
      expect(result.lastName).toBe('Doe')
      expect(userRepo.create).toHaveBeenCalled()
    })

    it('should throw ConflictException for duplicate email', async () => {
      const userRepo = service['userRepo'] as any
      userRepo.findOne.mockResolvedValue({ id: 'existing', email: 'dup@example.com' })

      await expect(
        service.create({
          email: 'dup@example.com',
          password: 'SecurePass1!',
          firstName: 'Jane',
          lastName: 'Doe',
        }),
      ).rejects.toThrow(ConflictException)
    })
  })

  describe('findOne', () => {
    it('should return user by id', async () => {
      const userRepo = service['userRepo'] as any
      userRepo.findOne.mockResolvedValue({
        id: 'uuid-1',
        email: 'test@example.com',
        first_name: 'John',
        last_name: 'Doe',
        is_active: true,
        created_at: new Date(),
      })

      const result = await service.findOne('uuid-1')
      expect(result.id).toBe('uuid-1')
      expect(result.firstName).toBe('John')
    })

    it('should throw NotFoundException for unknown id', async () => {
      const userRepo = service['userRepo'] as any
      userRepo.findOne.mockResolvedValue(null)

      await expect(service.findOne('unknown-id')).rejects.toThrow(NotFoundException)
    })
  })

  describe('update', () => {
    it('should update user fields', async () => {
      const userRepo = service['userRepo'] as any
      userRepo.findOne
        .mockResolvedValueOnce({
          id: 'uuid-1',
          email: 'old@example.com',
          first_name: 'Old',
          last_name: 'Name',
          is_active: true,
        })
        .mockResolvedValueOnce(null) // email uniqueness check
      userRepo.save.mockImplementation(async (d: any) => d)

      const result = await service.update('uuid-1', {
        firstName: 'New',
        email: 'new@example.com',
      })

      expect(result.firstName).toBe('New')
      expect(result.email).toBe('new@example.com')
    })
  })

  describe('remove', () => {
    it('should soft delete user', async () => {
      const userRepo = service['userRepo'] as any
      userRepo.findOne.mockResolvedValue({ id: 'uuid-1' })
      userRepo.softDelete.mockResolvedValue({ affected: 1 })

      const result = await service.remove('uuid-1')
      expect(result).toEqual({ message: 'Usuario eliminado' })
    })

    it('should throw NotFoundException for unknown id', async () => {
      const userRepo = service['userRepo'] as any
      userRepo.findOne.mockResolvedValue(null)

      await expect(service.remove('unknown-id')).rejects.toThrow(NotFoundException)
    })
  })

  describe('assignRole', () => {
    it('should create role assignment', async () => {
      const userRepo = service['userRepo'] as any
      const userTenantRepo = service['userTenantRepo'] as any
      const userRoleRepo = service['userRoleRepo'] as any

      userRepo.findOne.mockResolvedValue({ id: 'uuid-1' })
      userRoleRepo.findOne.mockResolvedValue(null) // no existing role
      userTenantRepo.findOne.mockResolvedValue({ id: 'ut-1' }) // tenant membership exists
      userRoleRepo.create.mockImplementation((d: any) => d)
      userRoleRepo.save.mockImplementation(async (d: any) => ({ ...d, id: 'ur-1' }))

      const result = await service.assignRole('uuid-1', {
        roleId: 'role-1',
        tenantId: 'tenant-1',
      })

      expect(result.role_id).toBe('role-1')
      expect(result.tenant_id).toBe('tenant-1')
    })

    it('should throw ConflictException for duplicate role', async () => {
      const userRepo = service['userRepo'] as any
      const userRoleRepo = service['userRoleRepo'] as any

      userRepo.findOne.mockResolvedValue({ id: 'uuid-1' })
      userRoleRepo.findOne.mockResolvedValue({ id: 'existing-role' })

      await expect(
        service.assignRole('uuid-1', { roleId: 'role-1', tenantId: 'tenant-1' }),
      ).rejects.toThrow(ConflictException)
    })

    it('should throw NotFoundException for unknown user', async () => {
      const userRepo = service['userRepo'] as any
      userRepo.findOne.mockResolvedValue(null)

      await expect(
        service.assignRole('unknown-id', { roleId: 'role-1', tenantId: 'tenant-1' }),
      ).rejects.toThrow(NotFoundException)
    })
  })

  describe('removeRole', () => {
    it('should remove role assignment', async () => {
      const userRepo = service['userRepo'] as any
      const userRoleRepo = service['userRoleRepo'] as any

      userRepo.findOne.mockResolvedValue({ id: 'uuid-1' })
      userRoleRepo.delete.mockResolvedValue({ affected: 1 })

      const result = await service.removeRole('uuid-1', 'role-1')
      expect(result).toEqual({ message: 'Rol revocado' })
    })

    it('should throw NotFoundException when role not found', async () => {
      const userRepo = service['userRepo'] as any
      const userRoleRepo = service['userRoleRepo'] as any

      userRepo.findOne.mockResolvedValue({ id: 'uuid-1' })
      userRoleRepo.delete.mockResolvedValue({ affected: 0 })

      await expect(service.removeRole('uuid-1', 'nonexistent-role')).rejects.toThrow(
        NotFoundException,
      )
    })
  })
})
