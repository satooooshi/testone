import { MigrationInterface, QueryRunner } from 'typeorm';

export class refreshIndexes1633670345276 implements MigrationInterface {
  name = 'refreshIndexes1633670345276';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IDX_5a6fa34a5f84ded5462ef8c38f ON wiki`,
    );
    await queryRunner.query(
      `DROP INDEX IDX_28a486ccf1cd11f2dd859adadf ON users`,
    );
    await queryRunner.query(
      `DROP INDEX IDX_43f7705b7297ca296329e506ea ON chat_groups`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE UNIQUE INDEX IDX_43f7705b7297ca296329e506ea ON chat_groups (event_id)`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX IDX_28a486ccf1cd11f2dd859adadf ON users (employee_id)`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX IDX_5a6fa34a5f84ded5462ef8c38f ON wiki (best_answer_id)`,
    );
  }
}
