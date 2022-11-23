import { MigrationInterface, QueryRunner } from 'typeorm';

export class addBaseTables1627981931788 implements MigrationInterface {
  name = 'addBaseTables1627981931788';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "CREATE TABLE `chat_groups` (`id` int NOT NULL AUTO_INCREMENT, `name` varchar(50) NOT NULL DEFAULT '', PRIMARY KEY (`id`)) ENGINE=InnoDB",
    );
    await queryRunner.query(
      "CREATE TABLE `chat_messages` (`id` int NOT NULL AUTO_INCREMENT, `content` longtext NOT NULL, `type` enum ('video', 'image', 'text') NOT NULL DEFAULT 'text', PRIMARY KEY (`id`)) ENGINE=InnoDB",
    );
    await queryRunner.query(
      "CREATE TABLE `departments` (`id` int NOT NULL AUTO_INCREMENT, `name` varchar(50) NOT NULL DEFAULT '', PRIMARY KEY (`id`)) ENGINE=InnoDB",
    );
    await queryRunner.query(
      "CREATE TABLE `event_files` (`id` int NOT NULL AUTO_INCREMENT, `url` varchar(255) NOT NULL DEFAULT '', `eventScheduleId` int NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB",
    );
    await queryRunner.query(
      "CREATE TABLE `event_videos` (`id` int NOT NULL AUTO_INCREMENT, `url` varchar(255) NOT NULL DEFAULT '', `eventScheduleId` int NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB",
    );
    await queryRunner.query(
      "CREATE TABLE `users` (`id` int NOT NULL AUTO_INCREMENT, `email` varchar(100) NOT NULL DEFAULT '', `last_name` varchar(50) NOT NULL DEFAULT '', `first_name` varchar(50) NOT NULL DEFAULT '', `password` varchar(200) NOT NULL DEFAULT '', `role` enum ('admin', 'regular', 'contract', 'dispatched') NOT NULL DEFAULT 'regular', `avatar_url` varchar(200) NOT NULL DEFAULT '', UNIQUE INDEX `IDX_97672ac88f789774dd47f7c8be` (`email`), PRIMARY KEY (`id`)) ENGINE=InnoDB",
    );
    await queryRunner.query(
      'CREATE TABLE `qa_answer_replies` (`id` int NOT NULL AUTO_INCREMENT, `body` longtext NOT NULL, `user_id` int NULL, `answer_id` int NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB',
    );
    await queryRunner.query(
      'CREATE TABLE `qa_answers` (`id` int NOT NULL AUTO_INCREMENT, `body` longtext NOT NULL, `question_id` int NULL, `user_id` int NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB',
    );
    await queryRunner.query(
      "CREATE TABLE `qa_questions` (`id` int NOT NULL AUTO_INCREMENT, `title` varchar(100) NOT NULL DEFAULT '', `body` longtext NOT NULL, `resolved_at` datetime NULL, `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updated_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), `user_id` int NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB",
    );
    await queryRunner.query(
      "CREATE TABLE `tags` (`id` int NOT NULL AUTO_INCREMENT, `name` varchar(30) NOT NULL DEFAULT '', PRIMARY KEY (`id`)) ENGINE=InnoDB",
    );
    await queryRunner.query(
      "CREATE TABLE `events` (`id` int NOT NULL AUTO_INCREMENT, `title` varchar(100) NOT NULL DEFAULT '', `description` longtext NOT NULL, `start_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, `end_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (`id`)) ENGINE=InnoDB",
    );
    await queryRunner.query(
      'CREATE TABLE `qa_linked_tags` (`question_id` int NOT NULL, `tag_id` int NOT NULL, INDEX `IDX_fc4fc519580a41443ceeda6f9f` (`question_id`), INDEX `IDX_d33350a5ae857cd19a95d71eca` (`tag_id`), PRIMARY KEY (`question_id`, `tag_id`)) ENGINE=InnoDB',
    );
    await queryRunner.query(
      'CREATE TABLE `user_joining_event` (`event_id` int NOT NULL, `user_id` int NOT NULL, INDEX `IDX_8e3906a795ab4dd368085070a3` (`event_id`), INDEX `IDX_fb26c4d1ce414dddb63c995745` (`user_id`), PRIMARY KEY (`event_id`, `user_id`)) ENGINE=InnoDB',
    );
    await queryRunner.query(
      'CREATE TABLE `event_linked_tags` (`event_id` int NOT NULL, `tag_id` int NOT NULL, INDEX `IDX_ebc4a915585c9c041e1ab76716` (`event_id`), INDEX `IDX_d58fb8cf2a637cb6d6d66b4bad` (`tag_id`), PRIMARY KEY (`event_id`, `tag_id`)) ENGINE=InnoDB',
    );
    await queryRunner.query(
      'ALTER TABLE `event_files` ADD CONSTRAINT `FK_4a1e8d0e254f8f33249de6ddc6e` FOREIGN KEY (`eventScheduleId`) REFERENCES `events`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION',
    );
    await queryRunner.query(
      'ALTER TABLE `event_videos` ADD CONSTRAINT `FK_a17ffa75b8aac2fa7ff8de78d23` FOREIGN KEY (`eventScheduleId`) REFERENCES `events`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION',
    );
    await queryRunner.query(
      'ALTER TABLE `qa_answer_replies` ADD CONSTRAINT `FK_791d57143696c88d24d41359ec2` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION',
    );
    await queryRunner.query(
      'ALTER TABLE `qa_answer_replies` ADD CONSTRAINT `FK_f6d8fdf3dcb5efb55986b167796` FOREIGN KEY (`answer_id`) REFERENCES `qa_answers`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION',
    );
    await queryRunner.query(
      'ALTER TABLE `qa_answers` ADD CONSTRAINT `FK_f1dd97c91c78a40a40fc8ceec93` FOREIGN KEY (`question_id`) REFERENCES `qa_questions`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION',
    );
    await queryRunner.query(
      'ALTER TABLE `qa_answers` ADD CONSTRAINT `FK_ae28197eb458e9fdb2a1e411a6b` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION',
    );
    await queryRunner.query(
      'ALTER TABLE `qa_questions` ADD CONSTRAINT `FK_44bbc194982179fb85c67da37f2` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION',
    );
    await queryRunner.query(
      'ALTER TABLE `qa_linked_tags` ADD CONSTRAINT `FK_fc4fc519580a41443ceeda6f9f2` FOREIGN KEY (`question_id`) REFERENCES `qa_questions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE',
    );
    await queryRunner.query(
      'ALTER TABLE `qa_linked_tags` ADD CONSTRAINT `FK_d33350a5ae857cd19a95d71eca6` FOREIGN KEY (`tag_id`) REFERENCES `tags`(`id`) ON DELETE CASCADE ON UPDATE CASCADE',
    );
    await queryRunner.query(
      'ALTER TABLE `user_joining_event` ADD CONSTRAINT `FK_8e3906a795ab4dd368085070a36` FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON DELETE CASCADE ON UPDATE CASCADE',
    );
    await queryRunner.query(
      'ALTER TABLE `user_joining_event` ADD CONSTRAINT `FK_fb26c4d1ce414dddb63c9957453` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE',
    );
    await queryRunner.query(
      'ALTER TABLE `event_linked_tags` ADD CONSTRAINT `FK_ebc4a915585c9c041e1ab767168` FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON DELETE CASCADE ON UPDATE CASCADE',
    );
    await queryRunner.query(
      'ALTER TABLE `event_linked_tags` ADD CONSTRAINT `FK_d58fb8cf2a637cb6d6d66b4badb` FOREIGN KEY (`tag_id`) REFERENCES `tags`(`id`) ON DELETE CASCADE ON UPDATE CASCADE',
    );
    await queryRunner.query(
      'CREATE FULLTEXT INDEX `IDX_ef2fb839248017665e5033e730` ON `qa_questions` (title, body) WITH PARSER ngram;',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'DROP INDEX `IDX_ef2fb839248017665e5033e730` ON `qa_questions`',
    );
    await queryRunner.query(
      'ALTER TABLE `event_linked_tags` DROP FOREIGN KEY `FK_d58fb8cf2a637cb6d6d66b4badb`',
    );
    await queryRunner.query(
      'ALTER TABLE `event_linked_tags` DROP FOREIGN KEY `FK_ebc4a915585c9c041e1ab767168`',
    );
    await queryRunner.query(
      'ALTER TABLE `user_joining_event` DROP FOREIGN KEY `FK_fb26c4d1ce414dddb63c9957453`',
    );
    await queryRunner.query(
      'ALTER TABLE `user_joining_event` DROP FOREIGN KEY `FK_8e3906a795ab4dd368085070a36`',
    );
    await queryRunner.query(
      'ALTER TABLE `qa_linked_tags` DROP FOREIGN KEY `FK_d33350a5ae857cd19a95d71eca6`',
    );
    await queryRunner.query(
      'ALTER TABLE `qa_linked_tags` DROP FOREIGN KEY `FK_fc4fc519580a41443ceeda6f9f2`',
    );
    await queryRunner.query(
      'ALTER TABLE `qa_questions` DROP FOREIGN KEY `FK_44bbc194982179fb85c67da37f2`',
    );
    await queryRunner.query(
      'ALTER TABLE `qa_answers` DROP FOREIGN KEY `FK_ae28197eb458e9fdb2a1e411a6b`',
    );
    await queryRunner.query(
      'ALTER TABLE `qa_answers` DROP FOREIGN KEY `FK_f1dd97c91c78a40a40fc8ceec93`',
    );
    await queryRunner.query(
      'ALTER TABLE `qa_answer_replies` DROP FOREIGN KEY `FK_f6d8fdf3dcb5efb55986b167796`',
    );
    await queryRunner.query(
      'ALTER TABLE `qa_answer_replies` DROP FOREIGN KEY `FK_791d57143696c88d24d41359ec2`',
    );
    await queryRunner.query(
      'ALTER TABLE `event_videos` DROP FOREIGN KEY `FK_a17ffa75b8aac2fa7ff8de78d23`',
    );
    await queryRunner.query(
      'ALTER TABLE `event_files` DROP FOREIGN KEY `FK_4a1e8d0e254f8f33249de6ddc6e`',
    );
    await queryRunner.query(
      'DROP INDEX `IDX_d58fb8cf2a637cb6d6d66b4bad` ON `event_linked_tags`',
    );
    await queryRunner.query(
      'DROP INDEX `IDX_ebc4a915585c9c041e1ab76716` ON `event_linked_tags`',
    );
    await queryRunner.query('DROP TABLE `event_linked_tags`');
    await queryRunner.query(
      'DROP INDEX `IDX_fb26c4d1ce414dddb63c995745` ON `user_joining_event`',
    );
    await queryRunner.query(
      'DROP INDEX `IDX_8e3906a795ab4dd368085070a3` ON `user_joining_event`',
    );
    await queryRunner.query('DROP TABLE `user_joining_event`');
    await queryRunner.query(
      'DROP INDEX `IDX_d33350a5ae857cd19a95d71eca` ON `qa_linked_tags`',
    );
    await queryRunner.query(
      'DROP INDEX `IDX_fc4fc519580a41443ceeda6f9f` ON `qa_linked_tags`',
    );
    await queryRunner.query('DROP TABLE `qa_linked_tags`');
    await queryRunner.query('DROP TABLE `events`');
    await queryRunner.query('DROP TABLE `tags`');
    await queryRunner.query('DROP TABLE `qa_questions`');
    await queryRunner.query('DROP TABLE `qa_answers`');
    await queryRunner.query('DROP TABLE `qa_answer_replies`');
    await queryRunner.query(
      'DROP INDEX `IDX_97672ac88f789774dd47f7c8be` ON `users`',
    );
    await queryRunner.query('DROP TABLE `users`');
    await queryRunner.query('DROP TABLE `event_videos`');
    await queryRunner.query('DROP TABLE `event_files`');
    await queryRunner.query('DROP TABLE `departments`');
    await queryRunner.query('DROP TABLE `chat_messages`');
    await queryRunner.query('DROP TABLE `chat_groups`');
  }
}
