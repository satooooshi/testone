import { MigrationInterface, QueryRunner } from 'typeorm';

export class createNameColumnInSubmissionFilesTable1648797222093
  implements MigrationInterface
{
  name = 'createNameColumnInSubmissionFilesTable1648797222093';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE submission_files ADD name varchar(2083) NOT NULL DEFAULT ''`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE submission_files DROP COLUMN name`);
  }
}
