import { MigrationInterface, QueryRunner } from 'typeorm';

export class addCreatedatUpdatedatColumn1628566463238
  implements MigrationInterface
{
  name = 'addCreatedatUpdatedatColumn1628566463238';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `tags` ADD `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)',
    );
    await queryRunner.query(
      'ALTER TABLE `tags` ADD `updated_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)',
    );
    await queryRunner.query(
      'ALTER TABLE `users` ADD `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)',
    );
    await queryRunner.query(
      'ALTER TABLE `users` ADD `updated_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `users` DROP COLUMN `updated_at`');
    await queryRunner.query('ALTER TABLE `users` DROP COLUMN `created_at`');
    await queryRunner.query('ALTER TABLE `tags` DROP COLUMN `updated_at`');
    await queryRunner.query('ALTER TABLE `tags` DROP COLUMN `created_at`');
  }
}
