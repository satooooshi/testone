import { MigrationInterface, QueryRunner } from 'typeorm';

export class addTableToDealWithChatReadTime1628659919498
  implements MigrationInterface
{
  name = 'addTableToDealWithChatReadTime1628659919498';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TABLE `last_read_chat_time` (`id` int NOT NULL AUTO_INCREMENT, `read_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, `user_id` int NULL, `chat_group_id` int NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB',
    );
    await queryRunner.query(
      'ALTER TABLE `last_read_chat_time` ADD CONSTRAINT `FK_20f4396149ecde74c165da69c27` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE',
    );
    await queryRunner.query(
      'ALTER TABLE `last_read_chat_time` ADD CONSTRAINT `FK_dda48cc22bab33e1a8b8f7932ce` FOREIGN KEY (`chat_group_id`) REFERENCES `chat_groups`(`id`) ON DELETE CASCADE ON UPDATE CASCADE',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `last_read_chat_time` DROP FOREIGN KEY `FK_dda48cc22bab33e1a8b8f7932ce`',
    );
    await queryRunner.query(
      'ALTER TABLE `last_read_chat_time` DROP FOREIGN KEY `FK_20f4396149ecde74c165da69c27`',
    );
    await queryRunner.query('DROP TABLE `last_read_chat_time`');
  }
}
