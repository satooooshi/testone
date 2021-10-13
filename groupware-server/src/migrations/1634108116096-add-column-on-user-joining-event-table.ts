import { MigrationInterface, QueryRunner } from 'typeorm';

export class addColumnOnUserJoiningEventTable1634108116096
  implements MigrationInterface
{
  name = 'addColumnOnUserJoiningEventTable1634108116096';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE user_joining_event DROP PRIMARY KEY`);
    await queryRunner.query(
      `ALTER TABLE user_joining_event ADD id int NOT NULL PRIMARY KEY AUTO_INCREMENT`,
    );
    await queryRunner.query(
      `ALTER TABLE user_joining_event ADD canceled_at timestamp NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE user_joining_event ADD late_minutes int NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE user_joining_event ADD created_at datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`,
    );
    await queryRunner.query(
      `ALTER TABLE user_joining_event ADD updated_at timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`,
    );
    await queryRunner.query(
      `ALTER TABLE user_joining_event CHANGE user_id user_id int NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE user_joining_event CHANGE event_id event_id int NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE user_joining_event ADD CONSTRAINT FK_fb26c4d1ce414dddb63c9957453 FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE user_joining_event ADD CONSTRAINT FK_8e3906a795ab4dd368085070a36 FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE user_joining_event DROP FOREIGN KEY FK_8e3906a795ab4dd368085070a36`,
    );
    await queryRunner.query(
      `ALTER TABLE user_joining_event DROP FOREIGN KEY FK_fb26c4d1ce414dddb63c9957453`,
    );
    await queryRunner.query(
      `ALTER TABLE user_joining_event CHANGE event_id event_id int NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE user_joining_event CHANGE user_id user_id int NOT NULL`,
    );
    await queryRunner.query(
      `alter table user_joining_event drop column updated_at`,
    );
    await queryRunner.query(
      `ALTER TABLE user_joining_event DROP COLUMN created_at`,
    );
    await queryRunner.query(
      `ALTER TABLE user_joining_event DROP COLUMN late_minutes`,
    );
    await queryRunner.query(
      `ALTER TABLE user_joining_event DROP COLUMN canceled_at`,
    );
    await queryRunner.query(`ALTER TABLE user_joining_event DROP COLUMN id`);
    await queryRunner.query(
      `ALTER TABLE user_joining_event ADD PRIMARY KEY (event_id, user_id)`,
    );
  }
}
