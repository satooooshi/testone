import { MigrationInterface, QueryRunner } from 'typeorm';

export class addRelationChatMessageAndGroup1628049111450
  implements MigrationInterface
{
  name = 'addRelationChatMessageAndGroup1628049111450';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `chat_messages` ADD `chat_group_id` int NULL',
    );
    await queryRunner.query(
      'ALTER TABLE `chat_messages` ADD CONSTRAINT `FK_7f6838b32b891a20e10f99553cc` FOREIGN KEY (`chat_group_id`) REFERENCES `chat_groups`(`id`) ON DELETE CASCADE ON UPDATE CASCADE',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `chat_messages` DROP FOREIGN KEY `FK_7f6838b32b891a20e10f99553cc`',
    );
    await queryRunner.query(
      'ALTER TABLE `chat_messages` DROP COLUMN `chat_group_id`',
    );
  }
}
