import { MigrationInterface, QueryRunner } from 'typeorm';

export class addStickerInChatMessageType1649303668434
  implements MigrationInterface
{
  name = 'addStickerInChatMessageType1649303668434';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE chat_messages CHANGE type type enum ('video', 'image', 'text', 'call', 'system_text', 'other_file', 'sticker') NOT NULL DEFAULT 'text'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE chat_messages CHANGE type type enum ('video', 'image', 'text', 'call', 'system_text', 'other_file') NOT NULL DEFAULT 'text'`,
    );
  }
}
