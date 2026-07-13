import { Test, TestingModule } from '@nestjs/testing'
import { AuthService } from './auth.service.js'
import { UsersService } from '../users/users.service.js'
import { JwtService } from '@nestjs/jwt'
import { UserRole } from '../users/user.entity.js'
import { UnauthorizedException, ConflictException } from '@nestjs/common'

describe('AuthService', () => {
  let service: AuthService

  const mockUsersService = () => ({
    findByEmail: jest.fn(),
    create: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
  })

  const mockJwtService = () => ({
    sign: jest.fn().mockReturnValue('mock-token'),
  })

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useFactory: mockUsersService },
        { provide: JwtService, useFactory: mockJwtService },
      ],
    }).compile()

    service = module.get<AuthService>(AuthService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('login', () => {
    it('should throw UnauthorizedException for wrong email', async () => {
      const usersService = { findByEmail: jest.fn().mockResolvedValue(null) }
      const module = await Test.createTestingModule({
        providers: [
          AuthService,
          { provide: UsersService, useFactory: () => usersService },
          { provide: JwtService, useFactory: mockJwtService },
        ],
      }).compile()
      const svc = module.get<AuthService>(AuthService)
      await expect(svc.login('wrong@email.com', 'pass')).rejects.toThrow(UnauthorizedException)
    })
  })

  describe('register', () => {
    it('should create user and return token', async () => {
      const mockUser = { id: 1, nombre: 'Test', email: 'test@email.com', rol: UserRole.ATTENDEE, password: 'hashed' }
      const module = await Test.createTestingModule({
        providers: [
          AuthService,
          { provide: UsersService, useFactory: () => ({ create: jest.fn().mockResolvedValue(mockUser) }) },
          { provide: JwtService, useFactory: mockJwtService },
        ],
      }).compile()
      const svc = module.get<AuthService>(AuthService)
      const result = await svc.register({ nombre: 'Test', email: 'test@email.com', password: 'pass123' })
      expect(result).toHaveProperty('token', 'mock-token')
      expect(result.user).not.toHaveProperty('password')
    })
  })

  describe('googleLogin', () => {
    it('should login or create user via Google', async () => {
      const mockUser = { id: 1, nombre: 'Google User', email: 'g@g.com', rol: UserRole.ATTENDEE, password: 'x' }
      const module = await Test.createTestingModule({
        providers: [
          AuthService,
          { provide: UsersService, useFactory: () => ({ findByEmail: jest.fn().mockResolvedValue(mockUser) }) },
          { provide: JwtService, useFactory: mockJwtService },
        ],
      }).compile()
      const svc = module.get<AuthService>(AuthService)
      const result = await svc.googleLogin({ googleId: '123', email: 'g@g.com', nombre: 'Google User' })
      expect(result).toHaveProperty('token')
    })
  })
})
