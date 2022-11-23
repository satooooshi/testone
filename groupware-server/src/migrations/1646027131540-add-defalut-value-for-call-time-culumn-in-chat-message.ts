import { MigrationInterface, QueryRunner } from 'typeorm';

export class addDefalutValueForCallTimeCulumnInChatMessage1646027131540
  implements MigrationInterface
{
  name = 'addDefalutValueForCallTimeCulumnInChatMessage1646027131540';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE chat_messages CHANGE call_time call_time varchar(255) NOT NULL DEFAULT ''`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE chat_messages CHANGE call_time call_time varchar(255) NOT NULL`,
    );
  }
}
