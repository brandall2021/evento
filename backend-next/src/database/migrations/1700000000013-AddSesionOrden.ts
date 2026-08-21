import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddSesionOrden1700000000013 implements MigrationInterface {
  name = 'AddSesionOrden1700000000013'

  public async up(queryRunner: QueryRunner): Promise<void> {
    const rows = await queryRunner.query(`
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'evento'
        AND table_name = 'sesiones'
        AND column_name = 'orden'
      LIMIT 1
    `)

    if (rows?.length) return

    await queryRunner.query(`ALTER TABLE "evento"."sesiones" ADD COLUMN "orden" integer NOT NULL DEFAULT 0`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const rows = await queryRunner.query(`
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'evento'
        AND table_name = 'sesiones'
        AND column_name = 'orden'
      LIMIT 1
    `)

    if (!rows?.length) return

    await queryRunner.query(`ALTER TABLE "evento"."sesiones" DROP COLUMN "orden"`)
  }
}
