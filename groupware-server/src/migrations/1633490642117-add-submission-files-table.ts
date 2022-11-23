import { MigrationInterface, QueryRunner } from 'typeorm';

export class addSubmissionFilesTable1633490642117
  implements MigrationInterface
{
  name = 'addSubmissionFilesTable1633490642117';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE submission_files (id int NOT NULL AUTO_INCREMENT, url varchar(255) NOT NULL DEFAULT '', created_at datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), updated_at timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), event_id int NULL, user_id int NULL, PRIMARY KEY (id)) ENGINE=InnoDB`,
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
    await queryRunner.query(`DROP TABLE submission_files`);
  }
}
