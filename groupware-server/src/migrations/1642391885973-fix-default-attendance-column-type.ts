import { MigrationInterface, QueryRunner } from 'typeorm';

export class fixDefaultAttendanceColumnType1642391885973
  implements MigrationInterface
{
  name = 'fixDefaultAttendanceColumnType1642391885973';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE default_attendance DROP COLUMN attendance_time`,
    );
    await queryRunner.query(
      `ALTER TABLE default_attendance ADD attendance_time time NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE default_attendance DROP COLUMN absence_time`,
    );
    await queryRunner.query(
      `ALTER TABLE default_attendance ADD absence_time time NOT NULL DEFAULT '0'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE default_attendance DROP COLUMN absence_time`,
    );
    await queryRunner.query(
      `ALTER TABLE default_attendance ADD absence_time datetime NOT NULL DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE default_attendance DROP COLUMN attendance_time`,
    );
    await queryRunner.query(
      `ALTER TABLE default_attendance ADD attendance_time datetime NOT NULL DEFAULT CURRENT_TIMESTAMP`,
    );
  }
}
