import { MigrationInterface, QueryRunner } from 'typeorm';

export class addChatEventRelation1632816546679 implements MigrationInterface {
  name = 'addChatEventRelation1632816546679';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE chat_groups ADD event_id int NULL`);
    await queryRunner.query(
      `ALTER TABLE chat_groups ADD UNIQUE INDEX IDX_43f7705b7297ca296329e506ea (event_id)`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX REL_43f7705b7297ca296329e506ea ON chat_groups (event_id)`,
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
      `DROP INDEX REL_43f7705b7297ca296329e506ea ON chat_groups`,
    );
    await queryRunner.query(
      `ALTER TABLE chat_groups DROP INDEX IDX_43f7705b7297ca296329e506ea`,
    );
    await queryRunner.query(`ALTER TABLE chat_groups DROP COLUMN event_id`);
  }
}
