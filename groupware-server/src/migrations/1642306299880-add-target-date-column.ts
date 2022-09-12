import { MigrationInterface, QueryRunner } from 'typeorm';

export class addTargetDateColumn1642306299880 implements MigrationInterface {
  name = 'addTargetDateColumn1642306299880';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE attendance ADD target_date datetime NOT NULL DEFAULT CURRENT_TIMESTAMP`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE attendance DROP COLUMN target_date`);
  }
}
