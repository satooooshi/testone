import { MigrationInterface, QueryRunner } from 'typeorm';

export class updateUserRole1634829525820 implements MigrationInterface {
  name = 'updateUserRole1634829525820';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE users CHANGE role role enum ('admin', 'instructor', 'external_instructor', 'internal_instructor', 'coach', 'common') NOT NULL DEFAULT 'common'`,
    );
    await queryRunner.query(
      `UPDATE users SET role = 'external_instructor' WHERE role = 'instructor'`,
    );
    await queryRunner.query(
      `ALTER TABLE users CHANGE role role enum ('admin', 'external_instructor', 'internal_instructor', 'coach', 'common') NOT NULL DEFAULT 'common'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE users CHANGE role role enum ('admin', 'instructor', 'external_instructor', 'internal_instructor', 'coach', 'common') NOT NULL DEFAULT 'common'`,
    );
    await queryRunner.query(
      `UPDATE users SET role = 'instructor' WHERE role = 'external_instructor'`,
    );
    await queryRunner.query(
      `ALTER TABLE users CHANGE role role enum ('admin', 'instructor', 'coach', 'common') NOT NULL DEFAULT 'common'`,
    );
  }
}
