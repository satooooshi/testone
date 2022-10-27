import { MigrationInterface, QueryRunner } from 'typeorm';

export class addMuteUsersInChatGroup1653297259910
  implements MigrationInterface
{
  name = 'addMuteUsersInChatGroup1653297259910';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE user_chat_mute (chat_group_id int NOT NULL, user_id int NOT NULL, INDEX IDX_49ca4eb99b6f036de87070907f (chat_group_id), INDEX IDX_a5c90971680da467fdd1cc929f (user_id), PRIMARY KEY (chat_group_id, user_id)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE user_chat_mute ADD CONSTRAINT FK_49ca4eb99b6f036de87070907f3 FOREIGN KEY (chat_group_id) REFERENCES chat_groups(id) ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE user_chat_mute ADD CONSTRAINT FK_a5c90971680da467fdd1cc929ff FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE user_chat_mute DROP FOREIGN KEY FK_a5c90971680da467fdd1cc929ff`,
    );
    await queryRunner.query(
      `ALTER TABLE user_chat_mute DROP FOREIGN KEY FK_49ca4eb99b6f036de87070907f3`,
    );
    await queryRunner.query(
      `DROP INDEX IDX_a5c90971680da467fdd1cc929f ON user_chat_mute`,
    );
    await queryRunner.query(
      `DROP INDEX IDX_49ca4eb99b6f036de87070907f ON user_chat_mute`,
    );
    await queryRunner.query(`DROP TABLE user_chat_mute`);
  }
}
