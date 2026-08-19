import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateSchema1700000000001 implements MigrationInterface {
  name = 'CreateSchema1700000000001'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS pgcrypto`)
    await queryRunner.query(`CREATE SCHEMA IF NOT EXISTS evento`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP SCHEMA IF EXISTS evento CASCADE`)
  }
}
