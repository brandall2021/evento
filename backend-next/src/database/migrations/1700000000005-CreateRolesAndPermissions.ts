import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateRolesAndPermissions1700000000005 implements MigrationInterface {
  name = 'CreateRolesAndPermissions1700000000005'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE evento.permissions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        code VARCHAR(100) NOT NULL UNIQUE,
        module VARCHAR(100) NOT NULL,
        action VARCHAR(100) NOT NULL,
        description VARCHAR(255),
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `)
    await queryRunner.query(`CREATE INDEX idx_permissions_module ON evento.permissions (module)`)

    await queryRunner.query(`
      CREATE TABLE evento.roles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID NOT NULL,
        name VARCHAR(100) NOT NULL,
        description VARCHAR(255),
        is_system BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        UNIQUE(tenant_id, name),
        FOREIGN KEY (tenant_id) REFERENCES evento.tenants(id)
      )
    `)
    await queryRunner.query(`CREATE INDEX idx_roles_tenant ON evento.roles (tenant_id)`)

    await queryRunner.query(`
      CREATE TABLE evento.role_permissions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        role_id UUID NOT NULL,
        permission_id UUID NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        UNIQUE(role_id, permission_id),
        FOREIGN KEY (role_id) REFERENCES evento.roles(id) ON DELETE CASCADE,
        FOREIGN KEY (permission_id) REFERENCES evento.permissions(id) ON DELETE CASCADE
      )
    `)
    await queryRunner.query(`CREATE INDEX idx_role_permissions_role ON evento.role_permissions (role_id)`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS evento.role_permissions`)
    await queryRunner.query(`DROP TABLE IF EXISTS evento.roles`)
    await queryRunner.query(`DROP TABLE IF EXISTS evento.permissions`)
  }
}
