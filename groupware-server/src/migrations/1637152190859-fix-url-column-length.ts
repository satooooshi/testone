import { MigrationInterface, QueryRunner } from 'typeorm';

export class fixUrlColumnLength1637152190859 implements MigrationInterface {
  name = 'fixUrlColumnLength1637152190859';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE event_files MODIFY COLUMN url varchar(2083)`,
    );
    await queryRunner.query(
      `ALTER TABLE event_videos MODIFY COLUMN url varchar(2083)`,
    );
    await queryRunner.query(
      `ALTER TABLE submission_files MODIFY COLUMN url varchar(2083)`,
    );
    await queryRunner.query(
      `ALTER TABLE events MODIFY COLUMN image_url varchar(2083)`,
    );
    await queryRunner.query(
      `ALTER TABLE users MODIFY COLUMN avatar_url varchar(2083)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE users MODIFY COLUMN avatar_url varchar(200)`,
    );
    await queryRunner.query(
      `ALTER TABLE events MODIFY COLUMN image_url varchar(200)`,
    );
    await queryRunner.query(
      `ALTER TABLE submission_files MODIFY COLUMN url varchar(200)`,
    );
    await queryRunner.query(
      `ALTER TABLE event_videos MODIFY COLUMN url varchar(255)`,
    );
    await queryRunner.query(
      `ALTER TABLE event_files MODIFY COLUMN url varchar(255)`,
    );
  }
}
