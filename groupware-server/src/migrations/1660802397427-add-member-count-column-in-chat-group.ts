import { MigrationInterface, QueryRunner } from 'typeorm';

export class addMemberCountColumnInChatGroup1660802397427
  implements MigrationInterface
{
  name = 'addMemberCountColumnInChatGroup1660802397427';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE chat_groups ADD member_count int NOT NULL DEFAULT '0'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE chat_groups DROP COLUMN member_count`);
  }
}
