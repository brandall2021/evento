import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { JwtService } from '@nestjs/jwt'
import { Repository } from 'typeorm'
import { AuthService } from './auth.service.js'
import { User } from '../users/user.entity.js'
import { RefreshToken } from './entities/refresh-token.entity.js'
import { UserTenant } from './entities/user-tenant.entity.js'
import { UserRoleAssignment } from './entities/user-role-assignment.entity.js'
import { Role } from '../roles/entities/role.entity.js'
import { UnauthorizedException, ConflictException, GoneException } from '@nestjs/common'

describe('AuthService', () => {
  let service: AuthService

  const mockUserRepo = () => ({
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  })

  const mockRefreshTokenRepo = () => ({
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  })

  const mockUserTenantRepo = () => ({
    find: jest.fn(),
    findOne: jest.fn(),
  })

  const mockUserRoleRepo = () => ({
    find: jest.fn(),
  })

  const mockRoleRepo = () => ({})

  const mockJwtService = () => ({
    sign: jest.fn().mockReturnValue('mock-access-token'),
  })

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useFactory: mockUserRepo },
        { provide: getRepositoryToken(RefreshToken), useFactory: mockRefreshTokenRepo },
        { provide: getRepositoryToken(UserTenant), useFactory: mockUserTenantRepo },
        { provide: getRepositoryToken(UserRoleAssignment), useFactory: mockUserRoleRepo },
        { provide: getRepositoryToken(Role), useFactory: mockRoleRepo },
        { provide: JwtService, useFactory: mockJwtService },
      ],
    }).compile()

    service = module.get<AuthService>(AuthService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('register', () => {
    it('should create a user and return tokens', async () => {
      const userRepo = service['userRepo'] as any
      const userTenantRepo = service['userTenantRepo'] as any
      const userRoleRepo = service['userRoleRepo'] as any

      userRepo.findOne.mockResolvedValue(null)
      userRepo.create.mockImplementation((d: any) => d)
      userRepo.save.mockImplementation(async (d: any) => ({ ...d, id: 'uuid-1' }))

      userTenantRepo.findOne.mockResolvedValue(null)
      userTenantRepo.find.mockResolvedValue([])
      userRoleRepo.find.mockResolvedValue([])

      const result = await service.register({
        email: 'test@example.com',
        password: 'SecurePass1!',
        firstName: 'John',
        lastName: 'Doe',
      })

      expect(result).toHaveProperty('access_token')
      expect(result).toHaveProperty('refresh_token')
      expect(result.user.email).toBe('test@example.com')
      expect(result.user.firstName).toBe('John')
      expect(result.user.lastName).toBe('Doe')
    })
  })

  describe('register - duplicate email', () => {
    it('should throw ConflictException for duplicate email', async () => {
      const userRepo = service['userRepo'] as any
      userRepo.findOne.mockResolvedValue({ id: 'existing', email: 'dup@example.com' })

      await expect(
        service.register({
          email: 'dup@example.com',
          password: 'SecurePass1!',
          firstName: 'Jane',
          lastName: 'Doe',
        }),
      ).rejects.toThrow(ConflictException)
    })
  })

  describe('login', () => {
    it('should return tokens for valid credentials', async () => {
      const userRepo = service['userRepo'] as any
      const userTenantRepo = service['userTenantRepo'] as any
      const userRoleRepo = service['userRoleRepo'] as any

      userRepo.findOne.mockResolvedValue({
        id: 'uuid-1',
        email: 'test@example.com',
        password: '$2a$10$abcdefghijklmnopqrstuuFGHIJKLMNOPQRSTUVWXYZ01234',
        nombre: 'John Doe',
        activo: true,
      })

      userTenantRepo.findOne.mockResolvedValue(null)
      userTenantRepo.find.mockResolvedValue([])
      userRoleRepo.find.mockResolvedValue([])

      // Override bcrypt.compare for this test
      jest.spyOn(require('bcryptjs'), 'compare').mockResolvedValue(true as never)

      const result = await service.login('test@example.com', 'SecurePass1!')

      expect(result).toHaveProperty('access_token')
      expect(result).toHaveProperty('refresh_token')
      expect(result.user.email).toBe('test@example.com')

      jest.restoreAllMocks()
    })
  })

  describe('login - invalid credentials', () => {
    it('should throw UnauthorizedException for wrong password', async () => {
      const userRepo = service['userRepo'] as any
      userRepo.findOne.mockResolvedValue({
        id: 'uuid-1',
        email: 'test@example.com',
        password: '$2a$10$hashedpassword',
        activo: true,
      })

      jest.spyOn(require('bcryptjs'), 'compare').mockResolvedValue(false as never)

      await expect(service.login('test@example.com', 'wrong')).rejects.toThrow(
        UnauthorizedException,
      )

      jest.restoreAllMocks()
    })

    it('should throw UnauthorizedException for non-existent email', async () => {
      const userRepo = service['userRepo'] as any
      userRepo.findOne.mockResolvedValue(null)

      await expect(service.login('nobody@example.com', 'pass')).rejects.toThrow(
        UnauthorizedException,
      )
    })
  })

  describe('login - inactive user', () => {
    it('should throw UnauthorizedException for inactive user', async () => {
      const userRepo = service['userRepo'] as any
      userRepo.findOne.mockResolvedValue({
        id: 'uuid-1',
        email: 'inactive@example.com',
        password: '$2a$10$hashed',
        activo: false,
      })

      await expect(service.login('inactive@example.com', 'pass')).rejects.toThrow(
        UnauthorizedException,
      )
    })
  })

  describe('refresh', () => {
    it('should issue new tokens for valid refresh token', async () => {
      const userRepo = service['userRepo'] as any
      const refreshTokenRepo = service['refreshTokenRepo'] as any
      const userTenantRepo = service['userTenantRepo'] as any
      const userRoleRepo = service['userRoleRepo'] as any

      refreshTokenRepo.findOne.mockResolvedValue({
        id: 'rt-1',
        token_hash: 'hash',
        expires_at: new Date(Date.now() + 86400000),
        revoked_at: null,
        user: { id: 'uuid-1', email: 'test@example.com', nombre: 'John', activo: true },
      })
      refreshTokenRepo.save.mockResolvedValue(true)

      userTenantRepo.findOne.mockResolvedValue(null)
      userTenantRepo.find.mockResolvedValue([])
      userRoleRepo.find.mockResolvedValue([])

      const result = await service.refresh('raw-refresh-token')

      expect(result).toHaveProperty('access_token')
      expect(result).toHaveProperty('refresh_token')
      expect(refreshTokenRepo.save).toHaveBeenCalled()
    })
  })

  describe('refresh - revoked token', () => {
    it('should throw UnauthorizedException for revoked refresh token', async () => {
      const refreshTokenRepo = service['refreshTokenRepo'] as any
      refreshTokenRepo.findOne.mockResolvedValue({
        id: 'rt-1',
        revoked_at: new Date(),
      })

      await expect(service.refresh('revoked-token')).rejects.toThrow(UnauthorizedException)
    })

    it('should throw GoneException for expired refresh token', async () => {
      const refreshTokenRepo = service['refreshTokenRepo'] as any
      refreshTokenRepo.findOne.mockResolvedValue({
        id: 'rt-1',
        expires_at: new Date(Date.now() - 86400000),
        revoked_at: null,
      })

      await expect(service.refresh('expired-token')).rejects.toThrow(GoneException)
    })
  })

  describe('logout', () => {
    it('should revoke refresh token', async () => {
      const refreshTokenRepo = service['refreshTokenRepo'] as any
      refreshTokenRepo.findOne.mockResolvedValue({ id: 'rt-1', revoked_at: null })
      refreshTokenRepo.save.mockResolvedValue(true)

      const result = await service.logout('some-token')
      expect(result).toEqual({ message: 'Sesión cerrada' })
      expect(refreshTokenRepo.save).toHaveBeenCalled()
    })

    it('should succeed even if token not found', async () => {
      const refreshTokenRepo = service['refreshTokenRepo'] as any
      refreshTokenRepo.findOne.mockResolvedValue(null)

      const result = await service.logout('unknown-token')
      expect(result).toEqual({ message: 'Sesión cerrada' })
    })
  })
})
