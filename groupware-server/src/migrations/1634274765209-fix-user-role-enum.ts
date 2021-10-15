import { MigrationInterface, QueryRunner } from 'typeorm';

export class fixUserRoleEnum1634274765209 implements MigrationInterface {
  name = 'fixUserRoleEnum1634274765209';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE users CHANGE role role enum ('admin', 'instructor', 'head_office', 'coach', 'common') NOT NULL DEFAULT 'common'`,
    );
    await queryRunner.query(
      `UPDATE users SET role = 'coach' WHERE role = 'head_office'`,
    );
    await queryRunner.query(
      `ALTER TABLE users CHANGE role role enum ('admin', 'instructor', 'coach', 'common') NOT NULL DEFAULT 'common'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE users CHANGE role role enum ('admin', 'instructor', 'head_office', 'coach', 'common') NOT NULL DEFAULT 'common'`,
    );
    await queryRunner.query(
      `UPDATE users SET role = 'head_office' WHERE role = 'coach'`,
    );
    await queryRunner.query(
      `ALTER TABLE users CHANGE role role enum ('admin', 'instructor', 'head_office', 'common') NOT NULL DEFAULT 'common'`,
    );
  }
}
