import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateEnums1700000000002 implements MigrationInterface {
  name = 'CreateEnums1700000000002'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE evento.user_role AS ENUM (
        'super_admin', 'admin', 'organizador', 'coordinador',
        'docente', 'ponente', 'asistente', 'invitado',
        'checkin', 'moderador', 'expositor', 'estudiante'
      )
    `)
    await queryRunner.query(`
      CREATE TYPE evento.audit_action AS ENUM (
        'CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT',
        'REGISTER', 'PASSWORD_CHANGE', 'ROLE_CHANGE',
        'TENANT_SWITCH', 'EXPORT', 'BULK_IMPORT'
      )
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TYPE IF EXISTS evento.audit_action`)
    await queryRunner.query(`DROP TYPE IF EXISTS evento.user_role`)
  }
}
