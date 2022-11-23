import { MigrationInterface, QueryRunner } from 'typeorm';

export class addFullTextIndexUserTable1631005196164
  implements MigrationInterface
{
  name = 'addFullTextIndexUserTable1631005196164';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE FULLTEXT INDEX IDX_b6c400469d3f1b4bb9cf62e10f ON users (last_name, first_name, email)  WITH PARSER NGRAM`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IDX_b6c400469d3f1b4bb9cf62e10f ON users`,
    );
  }
}
