import { MigrationInterface, QueryRunner } from 'typeorm';

export class addModifiedatColumnInChatMessageTable1661173142517
  implements MigrationInterface
{
  name = 'addModifiedatColumnInChatMessageTable1661173142517';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE chat_messages ADD modified_at datetime NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE chat_messages DROP COLUMN modified_at`,
    );
  }
}
