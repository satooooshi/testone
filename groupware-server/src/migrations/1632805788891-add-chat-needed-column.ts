import { MigrationInterface, QueryRunner } from 'typeorm';

export class addChatNeededColumn1632805788891 implements MigrationInterface {
  name = 'addChatNeededColumn1632805788891';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE events ADD chat_needed tinyint NOT NULL DEFAULT 0`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE events DROP COLUMN chat_needed`);
  }
}
