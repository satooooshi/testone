import { MigrationInterface, QueryRunner } from 'typeorm';

export class devideUeerIntoroduce1635403196875 implements MigrationInterface {
  name = 'devideUeerIntoroduce1635403196875';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE users RENAME COLUMN introduce TO introduce_other`,
    );
    await queryRunner.query(
      `ALTER TABLE users ADD introduce_tech varchar(1000) NOT NULL DEFAULT ''`,
    );
    await queryRunner.query(
      `ALTER TABLE users ADD introduce_qualification varchar(1000) NOT NULL DEFAULT ''`,
    );
    await queryRunner.query(
      `ALTER TABLE users ADD introduce_hobby varchar(1000) NOT NULL DEFAULT ''`,
    );
    await queryRunner.query(
      `ALTER TABLE users ADD introduce_club varchar(1000) NOT NULL DEFAULT ''`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE users DROP COLUMN introduce_other`);
    await queryRunner.query(`ALTER TABLE users DROP COLUMN introduce_club`);
    await queryRunner.query(`ALTER TABLE users DROP COLUMN introduce_hobby`);
    await queryRunner.query(
      `ALTER TABLE users DROP COLUMN introduce_qualification`,
    );
    await queryRunner.query(`ALTER TABLE users DROP COLUMN introduce_tech`);
    await queryRunner.query(
      `ALTER TABLE users RENAME COLUMN introduce_other TO introduce`,
    );
  }
}
