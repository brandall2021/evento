import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateTenants1700000000003 implements MigrationInterface {
  name = 'CreateTenants1700000000003'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE evento.tenants (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        domain VARCHAR(255),
        logo_url VARCHAR(500),
        banner_url VARCHAR(500),
        settings JSONB DEFAULT '{}',
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        deleted_at TIMESTAMPTZ
      )
    `)
    await queryRunner.query(`CREATE INDEX idx_tenants_slug ON evento.tenants (slug)`)
    await queryRunner.query(`CREATE INDEX idx_tenants_domain ON evento.tenants (domain)`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS evento.idx_tenants_domain`)
    await queryRunner.query(`DROP INDEX IF EXISTS evento.idx_tenants_slug`)
    await queryRunner.query(`DROP TABLE IF EXISTS evento.tenants`)
  }
}
