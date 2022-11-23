import { MigrationInterface, QueryRunner } from 'typeorm';

export class addDefaultAttendanceTable1642388348701
  implements MigrationInterface
{
  name = 'addDefaultAttendanceTable1642388348701';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE default_attendance (id int NOT NULL AUTO_INCREMENT, attendance_time datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, absence_time datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, break_minutes int NOT NULL DEFAULT '0', created_at datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), updated_at timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), user_id int NULL, UNIQUE INDEX REL_06b56c6af140129a0b06913927 (user_id), PRIMARY KEY (id)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE default_attendance ADD CONSTRAINT FK_06b56c6af140129a0b06913927e FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE default_attendance DROP FOREIGN KEY FK_06b56c6af140129a0b06913927e`,
    );
    await queryRunner.query(
      `DROP INDEX REL_06b56c6af140129a0b06913927 ON default_attendance`,
    );
    await queryRunner.query(`DROP TABLE default_attendance`);
  }
}
