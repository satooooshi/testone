import { MigrationInterface, QueryRunner } from 'typeorm';

export class addNameColumnInEventFileTable1648539984673
  implements MigrationInterface
{
  name = 'addNameColumnInEventFileTable1648539984673';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE event_files ADD name varchar(2083) NOT NULL DEFAULT ''`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE event_files DROP COLUMN name`);
  }
}
