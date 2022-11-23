import { MigrationInterface, QueryRunner } from 'typeorm';

export class fixRelationRestriction1633916957962 implements MigrationInterface {
  name = 'fixRelationRestriction1633916957962';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE wiki DROP FOREIGN KEY FK_5a6fa34a5f84ded5462ef8c38f0`,
    );
    await queryRunner.query(
      `ALTER TABLE chat_groups DROP FOREIGN KEY FK_43f7705b7297ca296329e506ea4`,
    );
    await queryRunner.query(
      `ALTER TABLE wiki ADD CONSTRAINT FK_5a6fa34a5f84ded5462ef8c38f0 FOREIGN KEY (best_answer_id) REFERENCES qa_answers(id) ON DELETE SET NULL ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE chat_groups ADD CONSTRAINT FK_43f7705b7297ca296329e506ea4 FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE NO ACTION ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE chat_groups DROP FOREIGN KEY FK_43f7705b7297ca296329e506ea4`,
    );
    await queryRunner.query(
      `ALTER TABLE wiki DROP FOREIGN KEY FK_5a6fa34a5f84ded5462ef8c38f0`,
    );
    await queryRunner.query(
      `ALTER TABLE chat_groups ADD CONSTRAINT FK_43f7705b7297ca296329e506ea4 FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE SET NULL ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE wiki ADD CONSTRAINT FK_5a6fa34a5f84ded5462ef8c38f0 FOREIGN KEY (best_answer_id) REFERENCES qa_answers(id) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
