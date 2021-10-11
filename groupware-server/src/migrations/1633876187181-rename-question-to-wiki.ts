import { MigrationInterface, QueryRunner } from 'typeorm';

export class renameQuestionToWiki1633876187181 implements MigrationInterface {
  name = 'renameQuestionToWiki1633876187181';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE qa_linked_tags RENAME COLUMN question_id TO wiki_id`,
    );
    await queryRunner.query(`RENAME TABLE qa_linked_tags to wiki_linked_tags`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`RENAME TABLE wiki_linked_tags to qa_linked_tags`);
    await queryRunner.query(
      `ALTER TABLE qa_linked_tags RENAME COLUMN wiki_id TO question_id`,
    );
  }
}
