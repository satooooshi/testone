import { MigrationInterface, QueryRunner } from 'typeorm';

export class addFuriganaColumnUsersTable1643598495656
  implements MigrationInterface
{
  name = 'addFuriganaColumnUsersTable1643598495656';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE users ADD last_name_kana varchar(50) NOT NULL DEFAULT ''`,
    );
    await queryRunner.query(
      `ALTER TABLE users ADD first_name_kana varchar(50) NOT NULL DEFAULT ''`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE users DROP COLUMN first_name_kana`);
    await queryRunner.query(`ALTER TABLE users DROP COLUMN last_name_kana`);
  }
}
