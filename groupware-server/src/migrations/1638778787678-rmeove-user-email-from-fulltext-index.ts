import { MigrationInterface, QueryRunner } from 'typeorm';

export class rmeoveUserEmailFromFulltextIndex1638778787678
  implements MigrationInterface
{
  name = 'rmeoveUserEmailFromFulltextIndex1638778787678';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IDX_b6c400469d3f1b4bb9cf62e10f ON users`,
    );
    await queryRunner.query(
      `CREATE FULLTEXT INDEX IDX_0df0139cdb76b2db0ccaa2d435 ON users (last_name, first_name)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IDX_0df0139cdb76b2db0ccaa2d435 ON users`,
    );
    await queryRunner.query(
      `CREATE FULLTEXT INDEX IDX_b6c400469d3f1b4bb9cf62e10f ON users (last_name, first_name, email)`,
    );
  }
}
