import { MigrationInterface, QueryRunner } from 'typeorm';

export class addUserChatLeavingTable1662622043110
  implements MigrationInterface
{
  name = 'addUserChatLeavingTable1662622043110';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE user_chat_leaving (chat_group_id int NOT NULL, user_id int NOT NULL, INDEX IDX_215f9c1a26a2788ef7c8fcef58 (chat_group_id), INDEX IDX_5bf0303ef74aabfc9ca0ea0b76 (user_id), PRIMARY KEY (chat_group_id, user_id)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE user_chat_leaving ADD CONSTRAINT FK_215f9c1a26a2788ef7c8fcef58b FOREIGN KEY (chat_group_id) REFERENCES chat_groups(id) ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE user_chat_leaving ADD CONSTRAINT FK_5bf0303ef74aabfc9ca0ea0b76e FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE user_chat_leaving DROP FOREIGN KEY FK_5bf0303ef74aabfc9ca0ea0b76e`,
    );
    await queryRunner.query(
      `ALTER TABLE user_chat_leaving DROP FOREIGN KEY FK_215f9c1a26a2788ef7c8fcef58b`,
    );
    await queryRunner.query(
      `DROP INDEX IDX_5bf0303ef74aabfc9ca0ea0b76 ON user_chat_leaving`,
    );
    await queryRunner.query(
      `DROP INDEX IDX_215f9c1a26a2788ef7c8fcef58 ON user_chat_leaving`,
    );
    await queryRunner.query(`DROP TABLE user_chat_leaving`);
  }
}
