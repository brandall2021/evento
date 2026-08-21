import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateForms1700000000010 implements MigrationInterface {
  name = 'CreateForms1700000000010'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE evento.form_templates (
        id SERIAL PRIMARY KEY,
        slug VARCHAR(150) NOT NULL UNIQUE,
        name VARCHAR(255) NOT NULL,
        context VARCHAR(255),
        status VARCHAR(20) NOT NULL DEFAULT 'draft',
        draft_schema_json JSONB NOT NULL DEFAULT '{}'::jsonb,
        published_version_id INT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        deleted_at TIMESTAMPTZ
      )
    `)
    await queryRunner.query(`CREATE INDEX idx_form_templates_status ON evento.form_templates (status)`)

    await queryRunner.query(`
      CREATE TABLE evento.form_template_versions (
        id SERIAL PRIMARY KEY,
        form_template_id INT NOT NULL,
        version_number INT NOT NULL,
        schema_json JSONB NOT NULL,
        published_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        deleted_at TIMESTAMPTZ,
        UNIQUE(form_template_id, version_number),
        FOREIGN KEY (form_template_id) REFERENCES evento.form_templates(id) ON DELETE CASCADE
      )
    `)
    await queryRunner.query(`CREATE INDEX idx_form_template_versions_template ON evento.form_template_versions (form_template_id)`)

    await queryRunner.query(`ALTER TABLE evento.form_templates ADD CONSTRAINT fk_form_templates_published_version FOREIGN KEY (published_version_id) REFERENCES evento.form_template_versions(id)`)

    await queryRunner.query(`
      CREATE TABLE evento.form_submissions (
        id SERIAL PRIMARY KEY,
        form_template_id INT NOT NULL,
        form_template_version_id INT NOT NULL,
        payload_json JSONB NOT NULL,
        submitted_by_user_id VARCHAR(255),
        submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        deleted_at TIMESTAMPTZ,
        FOREIGN KEY (form_template_id) REFERENCES evento.form_templates(id) ON DELETE CASCADE,
        FOREIGN KEY (form_template_version_id) REFERENCES evento.form_template_versions(id) ON DELETE CASCADE
      )
    `)
    await queryRunner.query(`CREATE INDEX idx_form_submissions_template ON evento.form_submissions (form_template_id)`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS evento.idx_form_submissions_template`)
    await queryRunner.query(`DROP TABLE IF EXISTS evento.form_submissions`)
    await queryRunner.query(`ALTER TABLE evento.form_templates DROP CONSTRAINT IF EXISTS fk_form_templates_published_version`)
    await queryRunner.query(`DROP INDEX IF EXISTS evento.idx_form_template_versions_template`)
    await queryRunner.query(`DROP TABLE IF EXISTS evento.form_template_versions`)
    await queryRunner.query(`DROP INDEX IF EXISTS evento.idx_form_templates_status`)
    await queryRunner.query(`DROP TABLE IF EXISTS evento.form_templates`)
  }
}
