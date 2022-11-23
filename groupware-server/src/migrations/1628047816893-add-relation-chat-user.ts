import { MigrationInterface, QueryRunner } from 'typeorm';

export class addRelationChatUser1628047816893 implements MigrationInterface {
  name = 'addRelationChatUser1628047816893';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TABLE `user_chat_joining` (`chat_group_id` int NOT NULL, `user_id` int NOT NULL, INDEX `IDX_19eade15861a163247e6c30635` (`chat_group_id`), INDEX `IDX_f839fbe12568eca6f87d4f0a04` (`user_id`), PRIMARY KEY (`chat_group_id`, `user_id`)) ENGINE=InnoDB',
    );
    await queryRunner.query(
      'ALTER TABLE `chat_messages` ADD `sender_id` int NULL',
    );
    await queryRunner.query(
      'ALTER TABLE `chat_messages` ADD CONSTRAINT `FK_9e5fc47ecb06d4d7b84633b1718` FOREIGN KEY (`sender_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE',
    );
    await queryRunner.query(
      'ALTER TABLE `user_chat_joining` ADD CONSTRAINT `FK_19eade15861a163247e6c306353` FOREIGN KEY (`chat_group_id`) REFERENCES `chat_groups`(`id`) ON DELETE CASCADE ON UPDATE CASCADE',
    );
    await queryRunner.query(
      'ALTER TABLE `user_chat_joining` ADD CONSTRAINT `FK_f839fbe12568eca6f87d4f0a046` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `user_chat_joining` DROP FOREIGN KEY `FK_f839fbe12568eca6f87d4f0a046`',
    );
    await queryRunner.query(
      'ALTER TABLE `user_chat_joining` DROP FOREIGN KEY `FK_19eade15861a163247e6c306353`',
    );
    await queryRunner.query(
      'ALTER TABLE `chat_messages` DROP FOREIGN KEY `FK_9e5fc47ecb06d4d7b84633b1718`',
    );
    await queryRunner.query(
      'ALTER TABLE `chat_messages` DROP COLUMN `sender_id`',
    );
    await queryRunner.query(
      'DROP INDEX `IDX_f839fbe12568eca6f87d4f0a04` ON `user_chat_joining`',
    );
    await queryRunner.query(
      'DROP INDEX `IDX_19eade15861a163247e6c30635` ON `user_chat_joining`',
    );
    await queryRunner.query('DROP TABLE `user_chat_joining`');
  }
}
