import { MigrationInterface, QueryRunner } from 'typeorm';

export class addSystemChatMessage1634286932311 implements MigrationInterface {
  name = 'addSystemChatMessage1634286932311';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE chat_messages CHANGE type type enum ('video', 'image', 'text', 'system_text', 'other_file') NOT NULL DEFAULT 'text'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE chat_messages CHANGE type type enum ('video', 'image', 'text', 'other_file') NOT NULL DEFAULT 'text'`,
    );
  }
}
