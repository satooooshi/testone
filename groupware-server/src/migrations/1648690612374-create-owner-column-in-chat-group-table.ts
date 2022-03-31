import { MigrationInterface, QueryRunner } from 'typeorm';

export class createOwnerColumnInChatGroupTable1648690612374
  implements MigrationInterface
{
  name = 'createOwnerColumnInChatGroupTable1648690612374';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE user_chatGroupOwner_joining (chat_group_id int NOT NULL, user_id int NOT NULL, INDEX IDX_5334958740dbdeb18f0ac3265e (chat_group_id), INDEX IDX_114d2e22c719762b747e2af5eb (user_id), PRIMARY KEY (chat_group_id, user_id)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE user_chatGroupOwner_joining ADD CONSTRAINT FK_5334958740dbdeb18f0ac3265e9 FOREIGN KEY (chat_group_id) REFERENCES chat_groups(id) ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE user_chatGroupOwner_joining ADD CONSTRAINT FK_114d2e22c719762b747e2af5eb8 FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE user_chatGroupOwner_joining DROP FOREIGN KEY FK_114d2e22c719762b747e2af5eb8`,
    );
    await queryRunner.query(
      `ALTER TABLE user_chatGroupOwner_joining DROP FOREIGN KEY FK_5334958740dbdeb18f0ac3265e9`,
    );
    await queryRunner.query(
      `DROP INDEX IDX_114d2e22c719762b747e2af5eb ON user_chatGroupOwner_joining`,
    );
    await queryRunner.query(
      `DROP INDEX IDX_5334958740dbdeb18f0ac3265e ON user_chatGroupOwner_joining`,
    );
    await queryRunner.query(`DROP TABLE user_chatGroupOwner_joining`);
  }
}
