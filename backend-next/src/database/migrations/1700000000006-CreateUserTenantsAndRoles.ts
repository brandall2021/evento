import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateUserTenantsAndRoles1700000000006 implements MigrationInterface {
  name = 'CreateUserTenantsAndRoles1700000000006'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE evento.user_tenants (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL,
        tenant_id UUID NOT NULL,
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        UNIQUE(user_id, tenant_id),
        FOREIGN KEY (user_id) REFERENCES evento.users(id) ON DELETE CASCADE,
        FOREIGN KEY (tenant_id) REFERENCES evento.tenants(id) ON DELETE CASCADE
      )
    `)
    await queryRunner.query(`CREATE INDEX idx_user_tenants_user ON evento.user_tenants (user_id)`)
    await queryRunner.query(`CREATE INDEX idx_user_tenants_tenant ON evento.user_tenants (tenant_id)`)

    await queryRunner.query(`
      CREATE TABLE evento.user_roles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL,
        role_id UUID NOT NULL,
        tenant_id UUID NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        UNIQUE(user_id, role_id, tenant_id),
        FOREIGN KEY (user_id) REFERENCES evento.users(id) ON DELETE CASCADE,
        FOREIGN KEY (role_id) REFERENCES evento.roles(id) ON DELETE CASCADE,
        FOREIGN KEY (tenant_id) REFERENCES evento.tenants(id) ON DELETE CASCADE
      )
    `)
    await queryRunner.query(`CREATE INDEX idx_user_roles_user ON evento.user_roles (user_id)`)
    await queryRunner.query(`CREATE INDEX idx_user_roles_tenant ON evento.user_roles (tenant_id)`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS evento.idx_user_roles_tenant`)
    await queryRunner.query(`DROP INDEX IF EXISTS evento.idx_user_roles_user`)
    await queryRunner.query(`DROP TABLE IF EXISTS evento.user_roles`)
    await queryRunner.query(`DROP INDEX IF EXISTS evento.idx_user_tenants_tenant`)
    await queryRunner.query(`DROP INDEX IF EXISTS evento.idx_user_tenants_user`)
    await queryRunner.query(`DROP TABLE IF EXISTS evento.user_tenants`)
  }
}
