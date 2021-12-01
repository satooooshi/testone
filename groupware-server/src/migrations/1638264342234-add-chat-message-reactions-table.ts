import { MigrationInterface, QueryRunner } from 'typeorm';

export class addChatMessageReactionsTable1638264342234
  implements MigrationInterface
{
  name = 'addChatMessageReactionsTable1638264342234';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE chat_message_reactions (id int NOT NULL AUTO_INCREMENT, emoji varchar(50) NOT NULL, created_at datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), updated_at timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), user_id int NULL, chat_message_id int NULL, PRIMARY KEY (id)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE chat_message_reactions ADD CONSTRAINT FK_fb41ef3d282a5ccda057f0c856f FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE chat_message_reactions ADD CONSTRAINT FK_604ef75940ff33f718859e44640 FOREIGN KEY (chatMessage_id) REFERENCES chat_messages(id) ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE chat_message_reactions DROP FOREIGN KEY FK_604ef75940ff33f718859e44640`,
    );
    await queryRunner.query(
      `ALTER TABLE chat_message_reactions DROP FOREIGN KEY FK_fb41ef3d282a5ccda057f0c856f`,
    );
    await queryRunner.query(`DROP TABLE chat_message_reactions`);
  }
}
