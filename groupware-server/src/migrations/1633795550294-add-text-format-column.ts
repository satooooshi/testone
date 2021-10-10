import { MigrationInterface, QueryRunner } from 'typeorm';

export class addTextFormatColumn1633795550294 implements MigrationInterface {
  name = 'addTextFormatColumn1633795550294';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE qa_answer_replies ADD text_format enum ('markdown', 'html') NOT NULL DEFAULT 'markdown'`,
    );
    await queryRunner.query(
      `ALTER TABLE qa_answers ADD text_format enum ('markdown', 'html') NOT NULL DEFAULT 'markdown'`,
    );
    await queryRunner.query(
      `ALTER TABLE wiki ADD text_format enum ('markdown', 'html') NOT NULL DEFAULT 'markdown'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE wiki DROP COLUMN text_format`);
    await queryRunner.query(`ALTER TABLE qa_answers DROP COLUMN text_format`);
    await queryRunner.query(
      `ALTER TABLE qa_answer_replies DROP COLUMN text_format`,
    );
  }
}
