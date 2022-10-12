import { MigrationInterface, QueryRunner } from 'typeorm';

export class changeEventType1665560313631 implements MigrationInterface {
  name = 'changeEventType1665560313631';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE events CHANGE type type enum ('artist', 'idol', 'youtuber', 'tiktoker', 'instagramer', 'talent', 'other') NOT NULL DEFAULT 'artist'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE events CHANGE type type enum ('impressive_university', 'study_meeting', 'bolday', 'coach', 'club', 'submission_etc') NOT NULL DEFAULT 'study_meeting'`,
    );
  }
}
