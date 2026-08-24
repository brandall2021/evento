import { ExecutionContext, ForbiddenException } from '@nestjs/common'
import { RolesGuard } from './roles.guard'

describe('RolesGuard', () => {
  let guard: RolesGuard

  const mockContext = (user?: any, metadata?: string[]) => {
    const reflectorMock = {
      getAllAndOverride: jest.fn().mockReturnValue(metadata),
    }
    guard = new RolesGuard(reflectorMock as any)

    return {
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
      getHandler: jest.fn(),
      getClass: jest.fn(),
    } as unknown as ExecutionContext
  }

  it('should allow access when no roles are required', () => {
    const context = mockContext({ roles: ['admin'] }, undefined)
    expect(guard.canActivate(context)).toBe(true)
  })

  it('should allow access when empty roles array', () => {
    const context = mockContext({ roles: ['admin'] }, [])
    expect(guard.canActivate(context)).toBe(true)
  })

  it('should allow access when user has matching role via roles array', () => {
    const context = mockContext({ roles: ['admin', 'organizer'] }, ['admin'])
    expect(guard.canActivate(context)).toBe(true)
  })

  it('should allow access when user has matching role via single rol field', () => {
    const context = mockContext({ rol: 'admin' }, ['admin'])
    expect(guard.canActivate(context)).toBe(true)
  })

  it('should throw ForbiddenException when user has no matching role', () => {
    const context = mockContext({ roles: ['attendee'] }, ['admin'])
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException)
  })

  it('should throw ForbiddenException when user is undefined', () => {
    const context = mockContext(undefined, ['admin'])
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException)
  })
})
