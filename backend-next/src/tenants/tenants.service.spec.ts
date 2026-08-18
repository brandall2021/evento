import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { TenantsService } from './tenants.service.js'
import { Tenant } from './entities/tenant.entity.js'
import { ConflictException, NotFoundException } from '@nestjs/common'

describe('TenantsService', () => {
  let service: TenantsService

  const mockRepo = () => ({
    find: jest.fn().mockResolvedValue([]),
    findOne: jest.fn(),
    create: jest.fn((dto: any) => ({ id: 'uuid-1', ...dto })),
    save: jest.fn((t: any) => Promise.resolve(t)),
    remove: jest.fn(),
  })

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TenantsService,
        { provide: getRepositoryToken(Tenant), useFactory: mockRepo },
      ],
    }).compile()

    service = module.get<TenantsService>(TenantsService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('create', () => {
    it('should create a tenant', async () => {
      const repo = { findOne: jest.fn().mockResolvedValue(null), create: jest.fn((d: any) => ({ id: 'u1', ...d })), save: jest.fn((t: any) => Promise.resolve(t)) }
      const svc = new TenantsService(repo as any)
      const result = await svc.create({ name: 'Test', slug: 'test' })
      expect(result).toHaveProperty('id')
      expect(result.name).toBe('Test')
    })

    it('should throw ConflictException for duplicate slug', async () => {
      const repo = { findOne: jest.fn().mockResolvedValue({ slug: 'test' }), create: jest.fn(), save: jest.fn() }
      const svc = new TenantsService(repo as any)
      await expect(svc.create({ name: 'Test', slug: 'test' })).rejects.toThrow(ConflictException)
    })
  })

  describe('findAll', () => {
    it('should return an array of tenants', async () => {
      const result = await service.findAll()
      expect(Array.isArray(result)).toBe(true)
    })
  })

  describe('findOne', () => {
    it('should return a tenant by id', async () => {
      const repo = { findOne: jest.fn().mockResolvedValue({ id: 'u1', name: 'Test', deleted_at: null }) }
      const svc = new TenantsService(repo as any)
      const result = await svc.findOne('u1')
      expect(result.id).toBe('u1')
    })

    it('should throw NotFoundException for missing tenant', async () => {
      const repo = { findOne: jest.fn().mockResolvedValue(null) }
      const svc = new TenantsService(repo as any)
      await expect(svc.findOne('nonexistent')).rejects.toThrow(NotFoundException)
    })
  })

  describe('update', () => {
    it('should update a tenant', async () => {
      const existing = { id: 'u1', slug: 'old', name: 'Old', deleted_at: null }
      const repo = {
        findOne: jest.fn()
          .mockResolvedValueOnce(existing)
          .mockResolvedValueOnce(null),
        create: jest.fn(),
        save: jest.fn((t: any) => Promise.resolve(t)),
      }
      const svc = new TenantsService(repo as any)
      const result = await svc.update('u1', { name: 'New' })
      expect(result.name).toBe('New')
    })
  })

  describe('remove', () => {
    it('should soft delete a tenant', async () => {
      const existing = { id: 'u1', name: 'Test', deleted_at: null }
      const repo = {
        findOne: jest.fn().mockResolvedValue(existing),
        create: jest.fn(),
        save: jest.fn((t: any) => Promise.resolve(t)),
      }
      const svc = new TenantsService(repo as any)
      const result = await svc.remove('u1')
      expect(result.message).toBe('Tenant deleted')
    })
  })
})
