import { MigrationInterface, QueryRunner } from 'typeorm';

export class addEventType1657888392417 implements MigrationInterface {
  name = 'addEventType1657888392417';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE events CHANGE type type enum ('impressive_university', 'study_meeting', 'bolday', 'coach', 'club', 'submission_etc', 'other') NOT NULL DEFAULT 'study_meeting'`,
    );
    await queryRunner.query(
      `ALTER TABLE event_introductions CHANGE type type enum ('impressive_university', 'study_meeting', 'bolday', 'coach', 'club', 'submission_etc', 'other') NOT NULL DEFAULT 'study_meeting'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE event_introductions CHANGE type type enum ('impressive_university', 'study_meeting', 'bolday', 'coach', 'club', 'submission_etc') NOT NULL DEFAULT 'study_meeting'`,
    );
    await queryRunner.query(
      `ALTER TABLE events CHANGE type type enum ('impressive_university', 'study_meeting', 'bolday', 'coach', 'club', 'submission_etc') NOT NULL DEFAULT 'study_meeting'`,
    );
  }
}
