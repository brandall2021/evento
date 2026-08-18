import { ExecutionContext, ForbiddenException } from '@nestjs/common'
import { PermissionsGuard } from './permissions.guard.js'

describe('PermissionsGuard', () => {
  let guard: PermissionsGuard

  const mockContext = (user?: any, metadata?: string[]) => {
    const reflectorMock = {
      getAllAndOverride: jest.fn().mockReturnValue(metadata),
    }
    guard = new PermissionsGuard(reflectorMock as any)

    return {
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
      getHandler: jest.fn(),
      getClass: jest.fn(),
    } as unknown as ExecutionContext
  }

  it('should allow access when no permissions are required', () => {
    const context = mockContext({ permissions: [] }, undefined)
    expect(guard.canActivate(context)).toBe(true)
  })

  it('should allow access when user has all required permissions', () => {
    const user = { permissions: ['user.create', 'user.update', 'user.read'] }
    const context = mockContext(user, ['user.create', 'user.update'])
    expect(guard.canActivate(context)).toBe(true)
  })

  it('should throw ForbiddenException when user is missing a permission', () => {
    const user = { permissions: ['user.read'] }
    const context = mockContext(user, ['user.create', 'user.update'])
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException)
  })

  it('should throw ForbiddenException with missing permissions in message', () => {
    const user = { permissions: [] }
    const context = mockContext(user, ['user.create', 'event.delete'])
    try {
      guard.canActivate(context)
      fail('Should have thrown')
    } catch (e) {
      expect(e).toBeInstanceOf(ForbiddenException)
      expect((e as ForbiddenException).message).toContain('user.create')
      expect((e as ForbiddenException).message).toContain('event.delete')
    }
  })

  it('should throw ForbiddenException when user is undefined', () => {
    const context = mockContext(undefined, ['user.create'])
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException)
  })
})
