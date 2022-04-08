import { MigrationInterface, QueryRunner } from 'typeorm';

export class addEventCommnetTable1628493730583 implements MigrationInterface {
  name = 'addEventCommnetTable1628493730583';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "CREATE TABLE `event_comment` (`id` int NOT NULL AUTO_INCREMENT, `content` varchar(500) NOT NULL DEFAULT '', `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updated_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), `event_id` int NULL, `writer_id` int NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB",
    );
    await queryRunner.query(
      'ALTER TABLE `event_comment` ADD CONSTRAINT `FK_1aaf33fe75c4f3ed1711cbc6b08` FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON DELETE CASCADE ON UPDATE CASCADE',
    );
    await queryRunner.query(
      'ALTER TABLE `event_comment` ADD CONSTRAINT `FK_8fd4ec9f627a95ac278027be973` FOREIGN KEY (`writer_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `event_comment` DROP FOREIGN KEY `FK_8fd4ec9f627a95ac278027be973`',
    );
    await queryRunner.query(
      'ALTER TABLE `event_comment` DROP FOREIGN KEY `FK_1aaf33fe75c4f3ed1711cbc6b08`',
    );
    await queryRunner.query('DROP TABLE `event_comment`');
  }
}
