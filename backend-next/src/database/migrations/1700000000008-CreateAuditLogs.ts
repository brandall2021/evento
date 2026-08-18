import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateAuditLogs1700000000008 implements MigrationInterface {
  name = 'CreateAuditLogs1700000000008'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE evento.audit_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID NOT NULL,
        user_id UUID,
        action evento.audit_action NOT NULL,
        entity VARCHAR(100) NOT NULL,
        entity_id UUID,
        old_values JSONB,
        new_values JSONB,
        ip_address INET,
        user_agent VARCHAR(500),
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        FOREIGN KEY (tenant_id) REFERENCES evento.tenants(id),
        FOREIGN KEY (user_id) REFERENCES evento.users(id)
      )
    `)
    await queryRunner.query(`CREATE INDEX idx_audit_logs_tenant ON evento.audit_logs (tenant_id)`)
    await queryRunner.query(`CREATE INDEX idx_audit_logs_user ON evento.audit_logs (user_id)`)
    await queryRunner.query(`CREATE INDEX idx_audit_logs_entity ON evento.audit_logs (entity, entity_id)`)
    await queryRunner.query(`CREATE INDEX idx_audit_logs_created ON evento.audit_logs (created_at)`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS evento.audit_logs`)
  }
}
