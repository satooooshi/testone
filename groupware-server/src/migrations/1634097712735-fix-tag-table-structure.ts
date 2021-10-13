import { MigrationInterface, QueryRunner } from 'typeorm';

export class fixTagTableStructure1634097712735 implements MigrationInterface {
  name = 'fixTagTableStructure1634097712735';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IDX_d90243459a697eadb8ad56e909 ON tags`,
    );
    await queryRunner.query(
      `DROP INDEX IDX_55d2e54203e04661fad0d06e04 ON user_tags`,
    );
    await queryRunner.query(
      `ALTER TABLE tags MODIFY COLUMN name varchar(60) NOT NULL DEFAULT ''`,
    );
    await queryRunner.query(
      `ALTER TABLE user_tags MODIFY COLUMN name varchar(60) NOT NULL DEFAULT ''`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX IDX_1f0d687740481a26473720e159 ON tags (name, type)`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX IDX_330341d47add3f56b6a17b5912 ON user_tags (name, type)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IDX_330341d47add3f56b6a17b5912 ON user_tags`,
    );
    await queryRunner.query(
      `DROP INDEX IDX_1f0d687740481a26473720e159 ON tags`,
    );
    await queryRunner.query(
      `ALTER TABLE user_tags MODIFY COLUMN name varchar(30) NOT NULL DEFAULT ''`,
    );
    await queryRunner.query(
      `ALTER TABLE tags MODIFY COLUMN name varchar(30) NOT NULL DEFAULT ''`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX IDX_55d2e54203e04661fad0d06e04 ON user_tags (name)`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX IDX_d90243459a697eadb8ad56e909 ON tags (name)`,
    );
  }
}
