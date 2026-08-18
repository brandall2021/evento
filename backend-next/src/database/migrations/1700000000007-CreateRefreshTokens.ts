import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateRefreshTokens1700000000007 implements MigrationInterface {
  name = 'CreateRefreshTokens1700000000007'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE evento.refresh_tokens (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL,
        token_hash VARCHAR(255) NOT NULL UNIQUE,
        expires_at TIMESTAMPTZ NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        revoked_at TIMESTAMPTZ,
        FOREIGN KEY (user_id) REFERENCES evento.users(id) ON DELETE CASCADE
      )
    `)
    await queryRunner.query(`CREATE INDEX idx_refresh_tokens_user ON evento.refresh_tokens (user_id)`)
    await queryRunner.query(`CREATE INDEX idx_refresh_tokens_hash ON evento.refresh_tokens (token_hash)`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS evento.idx_refresh_tokens_hash`)
    await queryRunner.query(`DROP INDEX IF EXISTS evento.idx_refresh_tokens_user`)
    await queryRunner.query(`DROP TABLE IF EXISTS evento.refresh_tokens`)
  }
}
