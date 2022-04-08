import {MigrationInterface, QueryRunner} from "typeorm";

export class addCreatedAtAndUpdatedAtColumns1627989391665 implements MigrationInterface {
    name = 'addCreatedAtAndUpdatedAtColumns1627989391665'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `chat_groups` ADD `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)");
        await queryRunner.query("ALTER TABLE `chat_groups` ADD `updated_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)");
        await queryRunner.query("ALTER TABLE `chat_messages` ADD `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)");
        await queryRunner.query("ALTER TABLE `chat_messages` ADD `updated_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)");
        await queryRunner.query("ALTER TABLE `departments` ADD `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)");
        await queryRunner.query("ALTER TABLE `departments` ADD `updated_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)");
        await queryRunner.query("ALTER TABLE `event_files` ADD `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)");
        await queryRunner.query("ALTER TABLE `event_files` ADD `updated_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)");
        await queryRunner.query("ALTER TABLE `event_videos` ADD `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)");
        await queryRunner.query("ALTER TABLE `event_videos` ADD `updated_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)");
        await queryRunner.query("ALTER TABLE `qa_answer_replies` ADD `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)");
        await queryRunner.query("ALTER TABLE `qa_answer_replies` ADD `updated_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)");
        await queryRunner.query("ALTER TABLE `qa_answers` ADD `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)");
        await queryRunner.query("ALTER TABLE `qa_answers` ADD `updated_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)");
        await queryRunner.query("ALTER TABLE `events` ADD `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)");
        await queryRunner.query("ALTER TABLE `events` ADD `updated_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `events` DROP COLUMN `updated_at`");
        await queryRunner.query("ALTER TABLE `events` DROP COLUMN `created_at`");
        await queryRunner.query("ALTER TABLE `qa_answers` DROP COLUMN `updated_at`");
        await queryRunner.query("ALTER TABLE `qa_answers` DROP COLUMN `created_at`");
        await queryRunner.query("ALTER TABLE `qa_answer_replies` DROP COLUMN `updated_at`");
        await queryRunner.query("ALTER TABLE `qa_answer_replies` DROP COLUMN `created_at`");
        await queryRunner.query("ALTER TABLE `event_videos` DROP COLUMN `updated_at`");
        await queryRunner.query("ALTER TABLE `event_videos` DROP COLUMN `created_at`");
        await queryRunner.query("ALTER TABLE `event_files` DROP COLUMN `updated_at`");
        await queryRunner.query("ALTER TABLE `event_files` DROP COLUMN `created_at`");
        await queryRunner.query("ALTER TABLE `departments` DROP COLUMN `updated_at`");
        await queryRunner.query("ALTER TABLE `departments` DROP COLUMN `created_at`");
        await queryRunner.query("ALTER TABLE `chat_messages` DROP COLUMN `updated_at`");
        await queryRunner.query("ALTER TABLE `chat_messages` DROP COLUMN `created_at`");
        await queryRunner.query("ALTER TABLE `chat_groups` DROP COLUMN `updated_at`");
        await queryRunner.query("ALTER TABLE `chat_groups` DROP COLUMN `created_at`");
    }

}
