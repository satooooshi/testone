import { MigrationInterface, QueryRunner } from 'typeorm';

export class fixPrimaryKeyInUserJoiningEventTable1634176173861
  implements MigrationInterface
{
  name = 'fixPrimaryKeyInUserJoiningEventTable1634176173861';
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE user_joining_event DROP FOREIGN KEY FK_fb26c4d1ce414dddb63c9957453`,
    );
    await queryRunner.query(
      `ALTER TABLE user_joining_event DROP FOREIGN KEY FK_8e3906a795ab4dd368085070a36`,
    );
    await queryRunner.query(
      `DROP INDEX IDX_8e3906a795ab4dd368085070a3 ON user_joining_event`,
    );
    await queryRunner.query(
      `DROP INDEX IDX_fb26c4d1ce414dddb63c995745 ON user_joining_event`,
    );
    await queryRunner.query(
      `ALTER TABLE user_joining_event CHANGE id id int NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE user_joining_event DROP PRIMARY KEY`);
    await queryRunner.query(
      `ALTER TABLE user_joining_event ADD PRIMARY KEY (id, user_id, event_id)`,
    );
    await queryRunner.query(
      `ALTER TABLE user_joining_event CHANGE id id int NOT NULL AUTO_INCREMENT`,
    );
    await queryRunner.query(
      `ALTER TABLE user_joining_event CHANGE user_id user_id int NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE user_joining_event CHANGE event_id event_id int NOT NULL`,
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
      `ALTER TABLE user_joining_event CHANGE event_id event_id int NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE user_joining_event CHANGE user_id user_id int NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE user_joining_event CHANGE id id int NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE user_joining_event DROP PRIMARY KEY`);
    await queryRunner.query(
      `ALTER TABLE user_joining_event ADD PRIMARY KEY (id)`,
    );
    await queryRunner.query(
      `ALTER TABLE user_joining_event CHANGE id id int NOT NULL AUTO_INCREMENT`,
    );
    await queryRunner.query(
      `CREATE INDEX IDX_fb26c4d1ce414dddb63c995745 ON user_joining_event (user_id)`,
    );
    await queryRunner.query(
      `CREATE INDEX IDX_8e3906a795ab4dd368085070a3 ON user_joining_event (event_id)`,
    );
    await queryRunner.query(
      `ALTER TABLE user_joining_event ADD CONSTRAINT FK_8e3906a795ab4dd368085070a36 FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE user_joining_event ADD CONSTRAINT FK_fb26c4d1ce414dddb63c9957453 FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }
}
