import { MigrationInterface, QueryRunner } from 'typeorm';

export class createAttendanceReportTable1646970570803
  implements MigrationInterface
{
  name = 'createAttendanceReportTable1646970570803';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE attendance_report (id int NOT NULL AUTO_INCREMENT, category enum ('common', 'paid_absence', 'late', 'train_delay', 'early_leaving', 'late_and_eary_leaving', 'holiday', 'holiday_work', 'transfer_holiday', 'go_out', 'shift_work', 'absence', 'half_holiday') NOT NULL DEFAULT 'common', reason enum ('common', 'private', 'sick', 'housework', 'holiday', 'condolence', 'site', 'disaster', 'meeting', 'birthday', 'morning_off', 'afternoon_off', 'late_off', 'early_leaving_off') NOT NULL DEFAULT 'common', target_date datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, detail longtext NOT NULL , report_date datetime NULL, verified_at datetime NULL, created_at datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), updated_at timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), user_id int NULL, PRIMARY KEY (id)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE attendance_report ADD CONSTRAINT FK_b6ed841743af40d4a8d1df2e215 FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE attendance_report DROP FOREIGN KEY FK_b6ed841743af40d4a8d1df2e215`,
    );
    await queryRunner.query(`DROP TABLE attendance_report`);
  }
}
