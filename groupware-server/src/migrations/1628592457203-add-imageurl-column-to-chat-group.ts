import { MigrationInterface, QueryRunner } from 'typeorm';

export class addImageurlColumnToChatGroup1628592457203
  implements MigrationInterface
{
  name = 'addImageurlColumnToChatGroup1628592457203';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "ALTER TABLE `chat_groups` ADD `image_url` varchar(500) NOT NULL DEFAULT ''",
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `chat_groups` DROP COLUMN `image_url`',
    );
  }
}
