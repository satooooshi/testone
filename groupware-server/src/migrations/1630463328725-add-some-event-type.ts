import { MigrationInterface, QueryRunner } from 'typeorm';

export class addSomeEventType1630463328725 implements MigrationInterface {
  name = 'addSomeEventType1630463328725';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE events CHANGE type type enum ('impressive_university', 'study_meeting', 'bolday', 'coach', 'club', 'submission_etc') NOT NULL DEFAULT 'study_meeting'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE events CHANGE type type enum ('impressive_university', 'study_meeting') NOT NULL DEFAULT 'study_meeting'`,
    );
  }
}
