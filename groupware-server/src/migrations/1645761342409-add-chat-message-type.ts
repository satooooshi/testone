import { MigrationInterface, QueryRunner } from 'typeorm';

export class addChatMessageType1645761342409 implements MigrationInterface {
  name = 'addChatMessageType1645761342409';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE chat_messages CHANGE type type enum ('video', 'image', 'text', 'call', 'system_text', 'other_file') NOT NULL DEFAULT 'text'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE chat_messages CHANGE type type enum ('video', 'image', 'text', 'system_text', 'other_file') NOT NULL DEFAULT 'text'`,
    );
  }
}
