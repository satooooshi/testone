import { MigrationInterface, QueryRunner } from 'typeorm';

export class fixRelationOfEventIntroduction1637496077055
  implements MigrationInterface
{
  name = 'fixRelationOfEventIntroduction1637496077055';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE event_introduction_sub_images (id int NOT NULL AUTO_INCREMENT, image_url varchar(500) NULL DEFAULT '', created_at timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), updated_at timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), event_introduction_id int NULL, PRIMARY KEY (id)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE event_introductions DROP COLUMN image_url_sub_1`,
    );
    await queryRunner.query(
      `ALTER TABLE event_introductions DROP COLUMN image_url_sub_2`,
    );
    await queryRunner.query(
      `ALTER TABLE event_introductions DROP COLUMN image_url_sub_3`,
    );
    await queryRunner.query(
      `ALTER TABLE event_introductions DROP COLUMN image_url_sub_4`,
    );
    await queryRunner.query(
      `ALTER TABLE event_introduction_sub_images DROP COLUMN event_introduction_id`,
    );
    await queryRunner.query(
      `ALTER TABLE event_introduction_sub_images ADD event_introduction_id int NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE event_introduction_sub_images ADD CONSTRAINT FK_032212f2525ae7ef0750d68a256 FOREIGN KEY (event_introduction_id) REFERENCES event_introductions(id) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE event_introduction_sub_images DROP FOREIGN KEY FK_032212f2525ae7ef0750d68a256`,
    );
    await queryRunner.query(
      `ALTER TABLE event_introduction_sub_images DROP COLUMN event_introduction_id`,
    );
    await queryRunner.query(
      `ALTER TABLE event_introduction_sub_images ADD event_introduction_id int NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE event_introductions ADD image_url_sub_4 varchar(500) NOT NULL DEFAULT ''`,
    );
    await queryRunner.query(
      `ALTER TABLE event_introductions ADD image_url_sub_3 varchar(500) NOT NULL DEFAULT ''`,
    );
    await queryRunner.query(
      `ALTER TABLE event_introductions ADD image_url_sub_2 varchar(500) NOT NULL DEFAULT ''`,
    );
    await queryRunner.query(
      `ALTER TABLE event_introductions ADD image_url_sub_1 varchar(500) NOT NULL DEFAULT ''`,
    );
    await queryRunner.query(`DROP TABLE event_introduction_sub_images`);
  }
}
