import 'reflect-metadata'

import { ROLES_KEY } from '../common/decorators/roles.decorator'
import { CheckinController } from './checkin.controller'
import { AcreditacionController } from './acreditacion.controller'
import { UserRole } from '../users/user.entity'
import { PATH_METADATA } from '@nestjs/common/constants'

describe('AcreditacionController', () => {
  const readRoles = (controller: any, method: string) =>
    Reflect.getMetadata(ROLES_KEY, controller.prototype[method]) as string[] | undefined

  it('mounts the canonical route on /acreditacion', () => {
    expect(Reflect.getMetadata(PATH_METADATA, AcreditacionController)).toBe('acreditacion')
  })

  it('mounts the alias route on /checkin', () => {
    expect(Reflect.getMetadata(PATH_METADATA, CheckinController)).toBe('checkin')
  })

  it('protects the QR generation endpoint with staff roles', () => {
    expect(readRoles(AcreditacionController, 'generarQr')).toEqual([
      UserRole.SUPER_ADMIN,
      UserRole.ADMIN,
      UserRole.CHECKIN,
      UserRole.COORDINATOR,
      UserRole.DOCENTE,
    ])
  })

  it('protects scan and manual endpoints with the same staff roles', () => {
    expect(readRoles(AcreditacionController, 'scanQr')).toEqual([
      UserRole.SUPER_ADMIN,
      UserRole.ADMIN,
      UserRole.CHECKIN,
      UserRole.COORDINATOR,
      UserRole.DOCENTE,
    ])
    expect(readRoles(CheckinController, 'scanQr')).toEqual([
      UserRole.SUPER_ADMIN,
      UserRole.ADMIN,
      UserRole.CHECKIN,
      UserRole.COORDINATOR,
      UserRole.DOCENTE,
    ])
    expect(readRoles(AcreditacionController, 'manual')).toEqual([
      UserRole.SUPER_ADMIN,
      UserRole.ADMIN,
      UserRole.CHECKIN,
      UserRole.COORDINATOR,
      UserRole.DOCENTE,
    ])
    expect(readRoles(CheckinController, 'manual')).toEqual([
      UserRole.SUPER_ADMIN,
      UserRole.ADMIN,
      UserRole.CHECKIN,
      UserRole.COORDINATOR,
      UserRole.DOCENTE,
    ])
  })
})
