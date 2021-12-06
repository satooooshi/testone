import { MigrationInterface, QueryRunner } from 'typeorm';

export class addNotificationDevicesTable1638521702243
  implements MigrationInterface
{
  name = 'addNotificationDevicesTable1638521702243';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE notification_devices (id int NOT NULL AUTO_INCREMENT, token varchar(255) NOT NULL, created_at datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), updated_at timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), user_id int NULL, PRIMARY KEY (id)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE notification_devices ADD CONSTRAINT FK_cb3c6a18d0dc0776dc7e50c8384 FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE notification_devices DROP FOREIGN KEY FK_cb3c6a18d0dc0776dc7e50c8384`,
    );
    await queryRunner.query(`DROP TABLE notification_devices`);
  }
}
