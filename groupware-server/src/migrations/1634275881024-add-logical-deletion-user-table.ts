import { MigrationInterface, QueryRunner } from 'typeorm';

export class addLogicalDeletionUserTable1634275881024
  implements MigrationInterface
{
  name = 'addLogicalDeletionUserTable1634275881024';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IDX_97672ac88f789774dd47f7c8be ON users`,
    );
    await queryRunner.query(
      `ALTER TABLE users ADD deleted_at timestamp(6) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE users ADD existence tinyint NULL DEFAULT 1`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX IDX_75c7f19d0eac3205018b5c8398 ON users (email, existence)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IDX_75c7f19d0eac3205018b5c8398 ON users`,
    );
    await queryRunner.query(`ALTER TABLE users DROP COLUMN existence`);
    await queryRunner.query(`ALTER TABLE users DROP COLUMN deleted_at`);
    await queryRunner.query(
      `CREATE UNIQUE INDEX IDX_97672ac88f789774dd47f7c8be ON users (email)`,
    );
  }
}
