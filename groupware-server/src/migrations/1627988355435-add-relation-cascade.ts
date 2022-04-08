import { MigrationInterface, QueryRunner } from 'typeorm';

export class addRelationCascade1627988355435 implements MigrationInterface {
  name = 'addRelationCascade1627988355435';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `event_files` DROP FOREIGN KEY `FK_4a1e8d0e254f8f33249de6ddc6e`',
    );
    await queryRunner.query(
      'ALTER TABLE `event_videos` DROP FOREIGN KEY `FK_a17ffa75b8aac2fa7ff8de78d23`',
    );
    await queryRunner.query(
      'ALTER TABLE `qa_answer_replies` DROP FOREIGN KEY `FK_791d57143696c88d24d41359ec2`',
    );
    await queryRunner.query(
      'ALTER TABLE `qa_answer_replies` DROP FOREIGN KEY `FK_f6d8fdf3dcb5efb55986b167796`',
    );
    await queryRunner.query(
      'ALTER TABLE `qa_answers` DROP FOREIGN KEY `FK_ae28197eb458e9fdb2a1e411a6b`',
    );
    await queryRunner.query(
      'ALTER TABLE `qa_answers` DROP FOREIGN KEY `FK_f1dd97c91c78a40a40fc8ceec93`',
    );
    await queryRunner.query(
      'ALTER TABLE `qa_questions` DROP FOREIGN KEY `FK_44bbc194982179fb85c67da37f2`',
    );
    await queryRunner.query(
      'ALTER TABLE `qa_linked_tags` DROP FOREIGN KEY `FK_fc4fc519580a41443ceeda6f9f2`',
    );
    await queryRunner.query(
      'DROP INDEX `IDX_ef2fb839248017665e5033e730` ON `qa_questions`',
    );
    await queryRunner.query(
      'ALTER TABLE `event_files` ADD CONSTRAINT `FK_4a1e8d0e254f8f33249de6ddc6e` FOREIGN KEY (`eventScheduleId`) REFERENCES `events`(`id`) ON DELETE CASCADE ON UPDATE CASCADE',
    );
    await queryRunner.query(
      'ALTER TABLE `event_videos` ADD CONSTRAINT `FK_a17ffa75b8aac2fa7ff8de78d23` FOREIGN KEY (`eventScheduleId`) REFERENCES `events`(`id`) ON DELETE CASCADE ON UPDATE CASCADE',
    );
    await queryRunner.query(
      'ALTER TABLE `qa_answer_replies` ADD CONSTRAINT `FK_791d57143696c88d24d41359ec2` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE',
    );
    await queryRunner.query(
      'ALTER TABLE `qa_answer_replies` ADD CONSTRAINT `FK_f6d8fdf3dcb5efb55986b167796` FOREIGN KEY (`answer_id`) REFERENCES `qa_answers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE',
    );
    await queryRunner.query(
      'ALTER TABLE `qa_answers` ADD CONSTRAINT `FK_f1dd97c91c78a40a40fc8ceec93` FOREIGN KEY (`question_id`) REFERENCES `qa_questions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE',
    );
    await queryRunner.query(
      'ALTER TABLE `qa_answers` ADD CONSTRAINT `FK_ae28197eb458e9fdb2a1e411a6b` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE',
    );
    await queryRunner.query(
      'ALTER TABLE `qa_questions` ADD CONSTRAINT `FK_44bbc194982179fb85c67da37f2` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE',
    );
    await queryRunner.query(
      'ALTER TABLE `qa_linked_tags` ADD CONSTRAINT `FK_fc4fc519580a41443ceeda6f9f2` FOREIGN KEY (`question_id`) REFERENCES `qa_questions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
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
      'CREATE FULLTEXT INDEX `IDX_ef2fb839248017665e5033e730` ON `qa_questions` (`title`, `body`)',
    );
    await queryRunner.query(
      'ALTER TABLE `qa_linked_tags` ADD CONSTRAINT `FK_fc4fc519580a41443ceeda6f9f2` FOREIGN KEY (`question_id`) REFERENCES `qa_question`(`id`) ON DELETE CASCADE ON UPDATE CASCADE',
    );
    await queryRunner.query(
      'ALTER TABLE `qa_questions` ADD CONSTRAINT `FK_44bbc194982179fb85c67da37f2` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION',
    );
    await queryRunner.query(
      'ALTER TABLE `qa_answers` ADD CONSTRAINT `FK_f1dd97c91c78a40a40fc8ceec93` FOREIGN KEY (`question_id`) REFERENCES `qa_question`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION',
    );
    await queryRunner.query(
      'ALTER TABLE `qa_answers` ADD CONSTRAINT `FK_ae28197eb458e9fdb2a1e411a6b` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION',
    );
    await queryRunner.query(
      'ALTER TABLE `qa_answer_replies` ADD CONSTRAINT `FK_f6d8fdf3dcb5efb55986b167796` FOREIGN KEY (`answer_id`) REFERENCES `qa_answers`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION',
    );
    await queryRunner.query(
      'ALTER TABLE `qa_answer_replies` ADD CONSTRAINT `FK_791d57143696c88d24d41359ec2` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION',
    );
    await queryRunner.query(
      'ALTER TABLE `event_videos` ADD CONSTRAINT `FK_a17ffa75b8aac2fa7ff8de78d23` FOREIGN KEY (`eventScheduleId`) REFERENCES `events`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION',
    );
    await queryRunner.query(
      'ALTER TABLE `event_files` ADD CONSTRAINT `FK_4a1e8d0e254f8f33249de6ddc6e` FOREIGN KEY (`eventScheduleId`) REFERENCES `events`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION',
    );
  }
}
