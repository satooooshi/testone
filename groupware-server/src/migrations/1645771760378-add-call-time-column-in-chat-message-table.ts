import { MigrationInterface, QueryRunner } from 'typeorm';

export class addCallTimeColumnInChatMessageTable1645771760378
  implements MigrationInterface
{
  name = 'addCallTimeColumnInChatMessageTable1645771760378';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE chat_messages ADD call_time varchar(255) NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE chat_messages DROP COLUMN call_time`);
  }
}
