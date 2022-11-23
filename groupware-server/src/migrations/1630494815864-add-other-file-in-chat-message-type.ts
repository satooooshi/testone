import { MigrationInterface, QueryRunner } from 'typeorm';

export class addOtherFileInChatMessageType1630494815864
  implements MigrationInterface
{
  name = 'addOtherFileInChatMessageType1630494815864';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE chat_messages CHANGE type type enum ('video', 'image', 'text', 'other_file') NOT NULL DEFAULT 'text'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE chat_messages CHANGE type type enum ('video', 'image', 'text') NOT NULL DEFAULT 'text'`,
    );
  }
}
