import { MigrationInterface, QueryRunner } from 'typeorm';

export class addVerifiedAtColumn1629367677814 implements MigrationInterface {
  name = 'addVerifiedAtColumn1629367677814';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `users` ADD `verified_at` datetime NULL',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `users` DROP COLUMN `verified_at`');
  }
}
