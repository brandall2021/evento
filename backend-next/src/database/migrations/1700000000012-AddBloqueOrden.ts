import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddBloqueOrden1700000000012 implements MigrationInterface {
  name = 'AddBloqueOrden1700000000012'

  public async up(queryRunner: QueryRunner): Promise<void> {
    const rows = await queryRunner.query(`
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'evento'
        AND table_name = 'bloques'
        AND column_name = 'orden'
      LIMIT 1
    `)

    if (rows?.length) return

    await queryRunner.query(`ALTER TABLE "evento"."bloques" ADD COLUMN "orden" integer NOT NULL DEFAULT 0`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const rows = await queryRunner.query(`
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'evento'
        AND table_name = 'bloques'
        AND column_name = 'orden'
      LIMIT 1
    `)

    if (!rows?.length) return

    await queryRunner.query(`ALTER TABLE "evento"."bloques" DROP COLUMN "orden"`)
  }
}
