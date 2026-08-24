import 'reflect-metadata'

import { ROLES_KEY } from '../common/decorators/roles.decorator'
import { CertificadosController } from './certificados.controller'
import { UserRole } from '../users/user.entity'

describe('CertificadosController', () => {
  const readRoles = (method: string) =>
    Reflect.getMetadata(ROLES_KEY, CertificadosController.prototype[method]) as string[] | undefined

  it('protects the revoke endpoint with admin role', () => {
    expect(readRoles('revocar')).toEqual([UserRole.ADMIN])
  })
})
