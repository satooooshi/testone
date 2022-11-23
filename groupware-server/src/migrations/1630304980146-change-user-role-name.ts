import { MigrationInterface, QueryRunner } from 'typeorm';

export class changeUserRoleName1630304980146 implements MigrationInterface {
  name = 'changeUserRoleName1630304980146';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE users CHANGE role role enum ('admin', 'regular', 'contract', 'dispatched', 'common') NOT NULL DEFAULT 'regular'`,
    );
    await queryRunner.query(
      `UPDATE users SET role = 'common' WHERE role = 'regular' OR role = 'contract' OR role = 'dispatched'`,
    );
    await queryRunner.query(
      `ALTER TABLE users CHANGE role role enum ('admin', 'instructor', 'head_office', 'common') NOT NULL DEFAULT 'common'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE users CHANGE role role enum ('admin', 'regular', 'contract', 'dispatched') NOT NULL DEFAULT 'regular'`,
    );
  }
}
