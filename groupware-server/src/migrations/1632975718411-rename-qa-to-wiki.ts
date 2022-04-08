import { MigrationInterface, QueryRunner } from 'typeorm';

export class renameQaToWiki1632975718411 implements MigrationInterface {
  name = 'renameQaToWiki1632975718411';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`RENAME TABLE qa_questions TO wiki`);
    await queryRunner.query(
      `ALTER TABLE wiki DROP FOREIGN KEY FK_44bbc194982179fb85c67da37f2`,
    );
    await queryRunner.query(
      `ALTER TABLE wiki DROP FOREIGN KEY FK_c060ac3c2d2ba52242c74b7e52e`,
    );
    await queryRunner.query(
      `DROP INDEX IDX_89c37917874c1da3bb25ae5641 ON wiki`,
    );
    await queryRunner.query(
      `DROP INDEX REL_c060ac3c2d2ba52242c74b7e52 ON wiki`,
    );
    await queryRunner.query(
      `ALTER TABLE wiki ADD UNIQUE INDEX IDX_5a6fa34a5f84ded5462ef8c38f (best_answer_id)`,
    );
    await queryRunner.query(
      `CREATE FULLTEXT INDEX IDX_1b3285fe87b2f72bee5cfc7a79 ON wiki (title, body)`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX REL_5a6fa34a5f84ded5462ef8c38f ON wiki (best_answer_id)`,
    );
    await queryRunner.query(
      `ALTER TABLE wiki ADD CONSTRAINT FK_533c492f60973e5278c26bbf342 FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE wiki ADD CONSTRAINT FK_5a6fa34a5f84ded5462ef8c38f0 FOREIGN KEY (best_answer_id) REFERENCES qa_answers(id) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE wiki DROP FOREIGN KEY FK_5a6fa34a5f84ded5462ef8c38f0`,
    );
    await queryRunner.query(
      `ALTER TABLE wiki DROP FOREIGN KEY FK_533c492f60973e5278c26bbf342`,
    );
    await queryRunner.query(
      `DROP INDEX REL_5a6fa34a5f84ded5462ef8c38f ON wiki`,
    );
    await queryRunner.query(
      `DROP INDEX IDX_1b3285fe87b2f72bee5cfc7a79 ON wiki`,
    );
    await queryRunner.query(
      `ALTER TABLE wiki DROP INDEX IDX_5a6fa34a5f84ded5462ef8c38f`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX REL_c060ac3c2d2ba52242c74b7e52 ON wiki (best_answer_id)`,
    );
    await queryRunner.query(
      `CREATE FULLTEXT INDEX IDX_89c37917874c1da3bb25ae5641 ON wiki (title, body)`,
    );
    await queryRunner.query(
      `ALTER TABLE wiki ADD CONSTRAINT FK_c060ac3c2d2ba52242c74b7e52e FOREIGN KEY (best_answer_id) REFERENCES qa_answers(id) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE wiki ADD CONSTRAINT FK_44bbc194982179fb85c67da37f2 FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(`RENAME TABLE wiki TO qa_questions`);
  }
}
