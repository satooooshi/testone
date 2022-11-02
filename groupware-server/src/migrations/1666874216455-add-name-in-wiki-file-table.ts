import { MigrationInterface, QueryRunner } from 'typeorm';

export class addNameInWikiFileTable1666874216455 implements MigrationInterface {
  name = 'addNameInWikiFileTable1666874216455';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE wiki_files ADD name varchar(2083) NOT NULL DEFAULT ''`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE wiki_files DROP COLUMN name`);
  }
}
