import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { TenantsService } from './tenants.service.js'
import { Tenant } from './entities/tenant.entity.js'
import { ConflictException, NotFoundException } from '@nestjs/common'

describe('TenantsService', () => {
  let service: TenantsService
  let repo: {
    find: jest.Mock
    findOne: jest.Mock
    create: jest.Mock
    save: jest.Mock
    softDelete: jest.Mock
  }

  beforeEach(async () => {
    repo = {
      find: jest.fn().mockResolvedValue([]),
      findOne: jest.fn(),
      create: jest.fn((dto: any) => ({ id: 'uuid-1', ...dto })),
      save: jest.fn((t: any) => Promise.resolve(t)),
      softDelete: jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TenantsService,
        { provide: getRepositoryToken(Tenant), useValue: repo },
      ],
    }).compile()

    service = module.get<TenantsService>(TenantsService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('create', () => {
    it('should create a tenant', async () => {
      repo.findOne.mockResolvedValue(null)
      const result = await service.create({ name: 'Test', slug: 'test' })
      expect(result).toHaveProperty('id')
      expect(result.name).toBe('Test')
    })

    it('should throw ConflictException for duplicate slug', async () => {
      repo.findOne.mockResolvedValue({ slug: 'test' })
      await expect(service.create({ name: 'Test', slug: 'test' })).rejects.toThrow(ConflictException)
    })
  })

  describe('findAll', () => {
    it('should return an array of tenants', async () => {
      const result = await service.findAll()
      expect(Array.isArray(result)).toBe(true)
      expect(repo.find).toHaveBeenCalled()
    })
  })

  describe('findOne', () => {
    it('should return a tenant by id', async () => {
      repo.findOne.mockResolvedValue({ id: 'u1', name: 'Test' })
      const result = await service.findOne('u1')
      expect(result.id).toBe('u1')
    })

    it('should throw NotFoundException for missing tenant', async () => {
      repo.findOne.mockResolvedValue(null)
      await expect(service.findOne('nonexistent')).rejects.toThrow(NotFoundException)
    })
  })

  describe('update', () => {
    it('should update a tenant', async () => {
      const existing = { id: 'u1', slug: 'old', name: 'Old' }
      repo.findOne
        .mockResolvedValueOnce(existing)   // findOne(id)
        .mockResolvedValueOnce(null)        // slug uniqueness check
      const result = await service.update('u1', { name: 'New' })
      expect(result.name).toBe('New')
    })

    it('should allow keeping the same slug', async () => {
      const existing = { id: 'u1', slug: 'my-slug', name: 'Old' }
      repo.findOne.mockResolvedValueOnce(existing)
      const result = await service.update('u1', { slug: 'my-slug', name: 'New' })
      expect(result.name).toBe('New')
    })
  })

  describe('remove', () => {
    it('should soft delete a tenant', async () => {
      repo.findOne.mockResolvedValue({ id: 'u1', name: 'Test' })
      const result = await service.remove('u1')
      expect(result.message).toBe('Tenant deleted')
      expect(repo.softDelete).toHaveBeenCalledWith('u1')
    })

    it('should throw NotFoundException if tenant not found', async () => {
      repo.findOne.mockResolvedValue(null)
      await expect(service.remove('nonexistent')).rejects.toThrow(NotFoundException)
    })
  })
})
