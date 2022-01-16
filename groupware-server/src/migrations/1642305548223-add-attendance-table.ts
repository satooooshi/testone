import { MigrationInterface, QueryRunner } from 'typeorm';

export class addAttendanceTable1642305548223 implements MigrationInterface {
  name = 'addAttendanceTable1642305548223';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE travel_cost (id int NOT NULL AUTO_INCREMENT, destination varchar(100) NOT NULL DEFAULT '', purpose varchar(100) NOT NULL DEFAULT '', departure_station varchar(100) NOT NULL DEFAULT '', via_station varchar(100) NOT NULL DEFAULT '', destination_station varchar(100) NOT NULL DEFAULT '', break_minutes int NOT NULL DEFAULT '0', one_way_or_round enum ('one_way', 'round') NOT NULL DEFAULT 'round', verified_at datetime NULL, created_at datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), updated_at timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), attendance_id int NULL, PRIMARY KEY (id)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE attendance (id int NOT NULL AUTO_INCREMENT, category enum ('common', 'paid_absence', 'late', 'train_delay', 'early_leaving', 'late_and_eary_leaving', 'holiday', 'holiday_work', 'transfer_holiday', 'go_out', 'shift_work', 'absence', 'half_holiday') NOT NULL DEFAULT 'common', reason enum ('common', 'private', 'sick', 'housework', 'holiday', 'condolence', 'site', 'disaster', 'meeting', 'birthday', 'morning_off', 'afternoon_off', 'late_off', 'early_leaving_off') NOT NULL DEFAULT 'common', attendance_time datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, absence_time datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, detail varchar(500) NOT NULL DEFAULT '', break_minutes int NOT NULL DEFAULT '0', report_date datetime NULL, verified_at datetime NULL, created_at datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), updated_at timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), user_id int NULL, PRIMARY KEY (id)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE applications_before_joining (id int NOT NULL AUTO_INCREMENT, attendance_time datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, destination varchar(100) NOT NULL DEFAULT '', purpose varchar(100) NOT NULL DEFAULT '', departure_station varchar(100) NOT NULL DEFAULT '', via_station varchar(100) NOT NULL DEFAULT '', destination_station varchar(100) NOT NULL DEFAULT '', break_minutes int NOT NULL DEFAULT '0', one_way_or_round enum ('one_way', 'round') NOT NULL DEFAULT 'round', verified_at datetime NULL, created_at datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), updated_at timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), user_id int NULL, PRIMARY KEY (id)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE travel_cost ADD CONSTRAINT FK_c38fae438ce1695639b9c98ca97 FOREIGN KEY (attendance_id) REFERENCES attendance(id) ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE attendance ADD CONSTRAINT FK_0bedbcc8d5f9b9ec4979f519597 FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE applications_before_joining ADD CONSTRAINT FK_57c540fea47fd2c4b678222d614 FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE applications_before_joining DROP FOREIGN KEY FK_57c540fea47fd2c4b678222d614`,
    );
    await queryRunner.query(
      `ALTER TABLE attendance DROP FOREIGN KEY FK_0bedbcc8d5f9b9ec4979f519597`,
    );
    await queryRunner.query(
      `ALTER TABLE travel_cost DROP FOREIGN KEY FK_c38fae438ce1695639b9c98ca97`,
    );
    await queryRunner.query(`DROP TABLE applications_before_joining`);
    await queryRunner.query(`DROP TABLE attendance`);
    await queryRunner.query(`DROP TABLE travel_cost`);
  }
}
