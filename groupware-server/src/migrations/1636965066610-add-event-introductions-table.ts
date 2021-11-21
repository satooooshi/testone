import { MigrationInterface, QueryRunner } from 'typeorm';

export class addEventIntroductionsTable1636965066610
  implements MigrationInterface
{
  name = 'addEventIntroductionsTable1636965066610';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE event_introductions (id int NOT NULL AUTO_INCREMENT, type enum ('impressive_university', 'study_meeting', 'bolday', 'coach', 'club', 'submission_etc') NOT NULL DEFAULT 'study_meeting', title varchar(100) NOT NULL DEFAULT '', description longtext NOT NULL, image_url varchar(500) NOT NULL DEFAULT '', image_url_sub_1 varchar(500) NOT NULL DEFAULT '', image_url_sub_2 varchar(500) NOT NULL DEFAULT '', image_url_sub_3 varchar(500) NOT NULL DEFAULT '', image_url_sub_4 varchar(500) NOT NULL DEFAULT '', created_at timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), updated_at timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX IDX_ad78d4c718ed0ff8d02352d8ef (type), PRIMARY KEY (id)) ENGINE=InnoDB`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IDX_ad78d4c718ed0ff8d02352d8ef ON event_introductions`,
    );
    await queryRunner.query(`DROP TABLE event_introductions`);
  }
}
