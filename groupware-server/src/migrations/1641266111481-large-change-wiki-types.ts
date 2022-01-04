import { MigrationInterface, QueryRunner } from 'typeorm';

export class largeChangeWikiTypes1641266111481 implements MigrationInterface {
  name = 'largeChangeWikiTypes1641266111481';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE wiki ADD board_category enum ('knowledge', 'question', 'news', 'impressive_university', 'club', 'study_meeting', 'celebration', 'other', '') NOT NULL COMMENT 'insert empty string to this column in the case of the type is not board' DEFAULT ''`,
    );
    await queryRunner.query(
      `ALTER TABLE wiki CHANGE type type enum ('rule', 'all-postal', 'board', 'knowledge', 'qa') NOT NULL DEFAULT 'board'`,
    );
    await queryRunner.query(
      `UPDATE wiki SET type = 'board', board_category = 'question' WHERE type = 'qa'`,
    );
    await queryRunner.query(
      `UPDATE wiki SET type = 'board', board_category = 'knowledge' WHERE type = 'knowledge'`,
    );
    await queryRunner.query(
      `ALTER TABLE wiki CHANGE type type enum ('rule', 'all-postal', 'board') NOT NULL DEFAULT 'board'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE wiki CHANGE type type enum ('rule', 'all-postal', 'board', 'knowledge', 'qa') NOT NULL DEFAULT 'board'`,
    );
    await queryRunner.query(
      `UPDATE wiki SET type = 'qa' WHERE type = 'board' AND board_category = 'question'`,
    );
    await queryRunner.query(
      `UPDATE wiki SET type = 'knowledge' WHERE type = 'board' AND board_category = 'knowledge'`,
    );
    await queryRunner.query(
      `ALTER TABLE wiki CHANGE type type enum ('rule', 'knowledge', 'all-postal', 'qa') NOT NULL DEFAULT 'qa'`,
    );
    await queryRunner.query(`ALTER TABLE wiki DROP COLUMN board_category`);
  }
}
