import { MigrationInterface, QueryRunner } from 'typeorm';

export class addIntroduceInUser1628589240982 implements MigrationInterface {
  name = 'addIntroduceInUser1628589240982';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "ALTER TABLE `users` ADD `introduce` varchar(1000) NOT NULL DEFAULT ''",
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `users` DROP COLUMN `introduce`');
  }
}
