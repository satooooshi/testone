import { MigrationInterface, QueryRunner } from 'typeorm';

export class addReplyParentMessageColumn1637724066557
  implements MigrationInterface
{
  name = 'addReplyParentMessageColumn1637724066557';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE chat_messages ADD reply_parent_id int NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE chat_messages ADD CONSTRAINT FK_69282c76d1287b36159edc95d31 FOREIGN KEY (reply_parent_id) REFERENCES chat_messages(id) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE chat_messages DROP FOREIGN KEY FK_69282c76d1287b36159edc95d31`,
    );
    await queryRunner.query(
      `ALTER TABLE chat_messages DROP COLUMN reply_parent_id`,
    );
  }
}
