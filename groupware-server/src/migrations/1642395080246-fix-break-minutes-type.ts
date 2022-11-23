import { MigrationInterface, QueryRunner } from 'typeorm';

export class fixBreakMinutesType1642395080246 implements MigrationInterface {
  name = 'fixBreakMinutesType1642395080246';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE attendance DROP COLUMN break_minutes`);
    await queryRunner.query(
      `ALTER TABLE default_attendance DROP COLUMN break_minutes`,
    );
    await queryRunner.query(
      `ALTER TABLE attendance ADD break_minutes time NOT NULL DEFAULT '00:00:00'`,
    );
    await queryRunner.query(
      `ALTER TABLE default_attendance ADD break_minutes time NOT NULL DEFAULT '00:00:00'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE default_attendance DROP COLUMN break_minutes`,
    );
    await queryRunner.query(`ALTER TABLE attendance DROP COLUMN break_minutes`);
    await queryRunner.query(
      `ALTER TABLE default_attendance ADD break_minutes int NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE attendance ADD break_minutes int NOT NULL DEFAULT '0'`,
    );
  }
}
