import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddWaitlistStatus1700000000011 implements MigrationInterface {
  name = 'AddWaitlistStatus1700000000011'

  public async up(queryRunner: QueryRunner): Promise<void> {
    const rows = await queryRunner.query(`
      SELECT udt_schema, udt_name
      FROM information_schema.columns
      WHERE table_schema = 'evento'
        AND table_name = 'inscripciones'
        AND column_name = 'estado'
      LIMIT 1
    `)

    const row = rows?.[0]
    if (!row?.udt_schema || !row?.udt_name) return

    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_type t
          JOIN pg_namespace n ON n.oid = t.typnamespace
          WHERE n.nspname = '${row.udt_schema}'
            AND t.typname = '${row.udt_name}'
            AND EXISTS (
              SELECT 1 FROM pg_enum e WHERE e.enumtypid = t.oid AND e.enumlabel = 'en_espera'
            )
        ) THEN
          ALTER TYPE "${row.udt_schema}"."${row.udt_name}" ADD VALUE 'en_espera'
        END IF;
      END $$;
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // PostgreSQL enums cannot safely remove values in-place.
  }
}
