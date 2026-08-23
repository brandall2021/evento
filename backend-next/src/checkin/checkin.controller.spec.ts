import 'reflect-metadata'

import { ROLES_KEY } from '../common/decorators/roles.decorator'
import { CheckinController } from './checkin.controller'
import { UserRole } from '../users/user.entity'

describe('CheckinController', () => {
  const readRoles = (method: keyof CheckinController) =>
    Reflect.getMetadata(ROLES_KEY, CheckinController.prototype[method]) as string[] | undefined

  it('protects the QR generation endpoint with staff roles', () => {
    expect(readRoles('generarQr')).toEqual([
      UserRole.SUPER_ADMIN,
      UserRole.ADMIN,
      UserRole.CHECKIN,
      UserRole.COORDINATOR,
      UserRole.DOCENTE,
    ])
  })

  it('protects scan and manual endpoints with the same staff roles', () => {
    expect(readRoles('scanQr')).toEqual([
      UserRole.SUPER_ADMIN,
      UserRole.ADMIN,
      UserRole.CHECKIN,
      UserRole.COORDINATOR,
      UserRole.DOCENTE,
    ])
    expect(readRoles('manual')).toEqual([
      UserRole.SUPER_ADMIN,
      UserRole.ADMIN,
      UserRole.CHECKIN,
      UserRole.COORDINATOR,
      UserRole.DOCENTE,
    ])
  })
})
