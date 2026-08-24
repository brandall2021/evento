import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateCertificadosCodigoSequence1700000000014 implements MigrationInterface {
  name = 'CreateCertificadosCodigoSequence1700000000014'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE SEQUENCE IF NOT EXISTS evento.certificados_codigo_seq START WITH 1 INCREMENT BY 1`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP SEQUENCE IF EXISTS evento.certificados_codigo_seq`)
  }
}
