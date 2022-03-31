import { MigrationInterface, QueryRunner } from 'typeorm';

export class changeWikiBoardCategory1647576323044
  implements MigrationInterface
{
  name = 'changeWikiBoardCategory1647576323044';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE wiki CHANGE board_category board_category enum ('knowledge', 'question', 'news', 'impressive_university', 'club', 'study_meeting', 'self_improvement', 'personal_announcement', 'celebration', 'other', '') NOT NULL COMMENT 'insert empty string to this column in the case of the type is not board' DEFAULT ''`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE wiki CHANGE board_category board_category enum ('knowledge', 'question', 'news', 'impressive_university', 'club', 'study_meeting', 'celebration', 'other', '') NOT NULL COMMENT 'insert empty string to this column in the case of the type is not board' DEFAULT ''`,
    );
  }
}
