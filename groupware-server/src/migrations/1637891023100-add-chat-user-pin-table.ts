import { MigrationInterface, QueryRunner } from 'typeorm';

export class addChatUserPinTable1637891023100 implements MigrationInterface {
  name = 'addChatUserPinTable1637891023100';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE chat_user_pin (chat_group_id int NOT NULL, user_id int NOT NULL, INDEX IDX_ab62fc276713ff7dcb7e16e526 (chat_group_id), INDEX IDX_1715865f8cb2ad125ca3b4de8c (user_id), PRIMARY KEY (chat_group_id, user_id)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE chat_user_pin ADD CONSTRAINT FK_ab62fc276713ff7dcb7e16e5262 FOREIGN KEY (chat_group_id) REFERENCES chat_groups(id) ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE chat_user_pin ADD CONSTRAINT FK_1715865f8cb2ad125ca3b4de8c7 FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE chat_user_pin DROP FOREIGN KEY FK_1715865f8cb2ad125ca3b4de8c7`,
    );
    await queryRunner.query(
      `ALTER TABLE chat_user_pin DROP FOREIGN KEY FK_ab62fc276713ff7dcb7e16e5262`,
    );
    await queryRunner.query(
      `DROP INDEX IDX_1715865f8cb2ad125ca3b4de8c ON chat_user_pin`,
    );
    await queryRunner.query(
      `DROP INDEX IDX_ab62fc276713ff7dcb7e16e526 ON chat_user_pin`,
    );
    await queryRunner.query(`DROP TABLE chat_user_pin`);
  }
}
