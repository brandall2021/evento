import { Test, TestingModule } from '@nestjs/testing'
import { ExecutionContext, CallHandler } from '@nestjs/common'
import { of } from 'rxjs'
import { AuditInterceptor } from './audit.interceptor.js'
import { AuditService } from '../../audit/audit.service.js'
import { AuditAction } from '../../audit/entities/audit-log.entity.js'

describe('AuditInterceptor', () => {
  let interceptor: AuditInterceptor
  let auditService: { log: jest.Mock }

  beforeEach(async () => {
    auditService = { log: jest.fn().mockResolvedValue(undefined) }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditInterceptor,
        { provide: AuditService, useValue: auditService },
      ],
    }).compile()

    interceptor = module.get<AuditInterceptor>(AuditInterceptor)
  })

  function mockContext(method: string, url: string, user?: Record<string, unknown>, body?: unknown) {
    return {
      switchToHttp: () => ({
        getRequest: () => ({
          method,
          originalUrl: url,
          user,
          body,
          ip: '127.0.0.1',
          socket: { remoteAddress: '127.0.0.1' },
          headers: { 'user-agent': 'test-agent' },
        }),
      }),
    } as unknown as ExecutionContext
  }

  function mockCallHandler(responseBody: unknown = { ok: true }): CallHandler {
    return { handle: () => of(responseBody) } as CallHandler
  }

  describe('mapMethodToAction (via intercept)', () => {
    it('should map POST to CREATE', async () => {
      const ctx = mockContext('POST', '/api/v1/users')
      await interceptor.intercept(ctx, mockCallHandler()).toPromise()
      expect(auditService.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: AuditAction.CREATE }),
      )
    })

    it('should map PATCH to UPDATE', async () => {
      const ctx = mockContext('PATCH', '/api/v1/users/123')
      await interceptor.intercept(ctx, mockCallHandler()).toPromise()
      expect(auditService.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: AuditAction.UPDATE }),
      )
    })

    it('should map PUT to UPDATE', async () => {
      const ctx = mockContext('PUT', '/api/v1/users/123')
      await interceptor.intercept(ctx, mockCallHandler()).toPromise()
      expect(auditService.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: AuditAction.UPDATE }),
      )
    })

    it('should map DELETE to DELETE', async () => {
      const ctx = mockContext('DELETE', '/api/v1/users/123')
      await interceptor.intercept(ctx, mockCallHandler()).toPromise()
      expect(auditService.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: AuditAction.DELETE }),
      )
    })

    it('should skip GET requests without logging', async () => {
      const ctx = mockContext('GET', '/api/v1/users')
      await interceptor.intercept(ctx, mockCallHandler()).toPromise()
      expect(auditService.log).not.toHaveBeenCalled()
    })

    it('should skip HEAD requests without logging', async () => {
      const ctx = mockContext('HEAD', '/api/v1/users')
      await interceptor.intercept(ctx, mockCallHandler()).toPromise()
      expect(auditService.log).not.toHaveBeenCalled()
    })
  })

  describe('extractEntity (via intercept)', () => {
    it('should extract entity from /api/v1/users/123', async () => {
      const ctx = mockContext('POST', '/api/v1/users/123')
      await interceptor.intercept(ctx, mockCallHandler()).toPromise()
      expect(auditService.log).toHaveBeenCalledWith(
        expect.objectContaining({ entity: 'users' }),
      )
    })

    it('should extract entity from /api/v1/audit-logs and replace hyphens', async () => {
      const ctx = mockContext('POST', '/api/v1/audit-logs')
      await interceptor.intercept(ctx, mockCallHandler()).toPromise()
      expect(auditService.log).toHaveBeenCalledWith(
        expect.objectContaining({ entity: 'audit_logs' }),
      )
    })

    it('should extract entity from /api/v1/cursos', async () => {
      const ctx = mockContext('POST', '/api/v1/cursos')
      await interceptor.intercept(ctx, mockCallHandler()).toPromise()
      expect(auditService.log).toHaveBeenCalledWith(
        expect.objectContaining({ entity: 'cursos' }),
      )
    })

    it('should return "unknown" when no v1 segment exists', async () => {
      const ctx = mockContext('POST', '/api/users')
      await interceptor.intercept(ctx, mockCallHandler()).toPromise()
      expect(auditService.log).toHaveBeenCalledWith(
        expect.objectContaining({ entity: 'unknown' }),
      )
    })

    it('should return "unknown" when v1 is the last segment', async () => {
      const ctx = mockContext('POST', '/api/v1')
      await interceptor.intercept(ctx, mockCallHandler()).toPromise()
      expect(auditService.log).toHaveBeenCalledWith(
        expect.objectContaining({ entity: 'unknown' }),
      )
    })
  })

  describe('interceptor integration', () => {
    it('should call auditService.log with all required fields', async () => {
      const user = { id: 'user-1', tenant_id: 'tenant-1' }
      const body = { name: 'Test' }
      const ctx = mockContext('POST', '/api/v1/cursos', user, body)
      await interceptor.intercept(ctx, mockCallHandler()).toPromise()
      expect(auditService.log).toHaveBeenCalledWith({
        tenant_id: 'tenant-1',
        user_id: 'user-1',
        action: AuditAction.CREATE,
        entity: 'cursos',
        new_values: body,
        ip_address: '127.0.0.1',
        user_agent: 'test-agent',
      })
    })

    it('should handle missing user gracefully', async () => {
      const ctx = mockContext('DELETE', '/api/v1/users/123')
      await interceptor.intercept(ctx, mockCallHandler()).toPromise()
      expect(auditService.log).toHaveBeenCalledWith(
        expect.objectContaining({
          tenant_id: undefined,
          user_id: undefined,
        }),
      )
    })

    it('should pass through the response unchanged', (done) => {
      const ctx = mockContext('POST', '/api/v1/users')
      const response = { id: '1', name: 'created' }
      interceptor.intercept(ctx, mockCallHandler(response)).subscribe((result) => {
        expect(result).toEqual(response)
        done()
      })
    })

    it('should not break the request if auditService.log fails', async () => {
      auditService.log.mockRejectedValueOnce(new Error('DB down'))
      const ctx = mockContext('POST', '/api/v1/users')
      const response = { id: '1' }
      const result = await interceptor.intercept(ctx, mockCallHandler(response)).toPromise()
      expect(result).toEqual(response)
    })
  })
})
