import { MigrationInterface, QueryRunner } from 'typeorm';

export class fixSubmissionFilesOption1639516792782
  implements MigrationInterface
{
  name = 'fixSubmissionFilesOption1639516792782';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE submission_files DROP FOREIGN KEY FK_48364131b0474201e8611144e8f`,
    );
    await queryRunner.query(
      `ALTER TABLE submission_files DROP FOREIGN KEY FK_02e70f73e326b35daa758657414`,
    );
    await queryRunner.query(
      `ALTER TABLE submission_files CHANGE url url varchar(2083) NOT NULL DEFAULT ''`,
    );
    await queryRunner.query(
      `DELETE FROM submission_files WHERE event_id IS NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE submission_files CHANGE event_id event_id int NOT NULL`,
    );
    await queryRunner.query(
      `DELETE FROM submission_files WHERE user_id IS NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE submission_files CHANGE user_id user_id int NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE submission_files ADD CONSTRAINT FK_48364131b0474201e8611144e8f FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE submission_files ADD CONSTRAINT FK_02e70f73e326b35daa758657414 FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE submission_files DROP FOREIGN KEY FK_02e70f73e326b35daa758657414`,
    );
    await queryRunner.query(
      `ALTER TABLE submission_files DROP FOREIGN KEY FK_48364131b0474201e8611144e8f`,
    );
    await queryRunner.query(
      `ALTER TABLE submission_files CHANGE user_id user_id int NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE submission_files CHANGE event_id event_id int NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE submission_files CHANGE url url varchar(2083) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE submission_files ADD CONSTRAINT FK_02e70f73e326b35daa758657414 FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE submission_files ADD CONSTRAINT FK_48364131b0474201e8611144e8f FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }
}
