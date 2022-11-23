import { MigrationInterface, QueryRunner } from 'typeorm';

export class addChatNotesTable1637738183470 implements MigrationInterface {
  name = 'addChatNotesTable1637738183470';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE chat_notes (id int NOT NULL AUTO_INCREMENT, content longtext NOT NULL, created_at datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), updated_at timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), chat_group_id int NULL, PRIMARY KEY (id)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE chat_user_editted (chat_group_id int NOT NULL, user_id int NOT NULL, INDEX IDX_09b42a3a2fda05b44870588b9a (chat_group_id), INDEX IDX_3d8afdf0e6bda00ba887fe1be1 (user_id), PRIMARY KEY (chat_group_id, user_id)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE chat_notes ADD CONSTRAINT FK_312a741c26f0a678e6e365c851d FOREIGN KEY (chat_group_id) REFERENCES chat_groups(id) ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE chat_user_editted ADD CONSTRAINT FK_09b42a3a2fda05b44870588b9a5 FOREIGN KEY (chat_group_id) REFERENCES chat_notes(id) ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE chat_user_editted ADD CONSTRAINT FK_3d8afdf0e6bda00ba887fe1be13 FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE chat_user_editted DROP FOREIGN KEY FK_3d8afdf0e6bda00ba887fe1be13`,
    );
    await queryRunner.query(
      `ALTER TABLE chat_user_editted DROP FOREIGN KEY FK_09b42a3a2fda05b44870588b9a5`,
    );
    await queryRunner.query(
      `DROP INDEX IDX_3d8afdf0e6bda00ba887fe1be1 ON chat_user_editted`,
    );
    await queryRunner.query(
      `DROP INDEX IDX_09b42a3a2fda05b44870588b9a ON chat_user_editted`,
    );
    await queryRunner.query(`DROP TABLE chat_user_editted`);
    await queryRunner.query(`DROP TABLE chat_notes`);
    await queryRunner.query(
      `ALTER TABLE chat_groups ADD CONSTRAINT FK_43f7705b7297ca296329e506ea4 FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE SET NULL ON UPDATE CASCADE`,
    );
  }
}
