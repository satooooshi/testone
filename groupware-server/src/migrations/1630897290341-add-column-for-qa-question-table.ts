import { MigrationInterface, QueryRunner } from 'typeorm';

export class addColumnForQaQuestionTable1630897290341
  implements MigrationInterface
{
  name = 'addColumnForQaQuestionTable1630897290341';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE qa_questions ADD best_answer_id int NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE qa_questions ADD UNIQUE INDEX IDX_c060ac3c2d2ba52242c74b7e52 (best_answer_id)`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX REL_c060ac3c2d2ba52242c74b7e52 ON qa_questions (best_answer_id)`,
    );
    await queryRunner.query(
      `ALTER TABLE qa_questions ADD CONSTRAINT FK_c060ac3c2d2ba52242c74b7e52e FOREIGN KEY (best_answer_id) REFERENCES qa_answers(id) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE qa_questions DROP FOREIGN KEY FK_c060ac3c2d2ba52242c74b7e52e`,
    );
    await queryRunner.query(
      `DROP INDEX REL_c060ac3c2d2ba52242c74b7e52 ON qa_questions`,
    );
    await queryRunner.query(
      `ALTER TABLE qa_questions DROP INDEX IDX_c060ac3c2d2ba52242c74b7e52`,
    );
    await queryRunner.query(
      `ALTER TABLE qa_questions DROP COLUMN best_answer_id`,
    );
  }
}
