import { MigrationInterface, QueryRunner } from 'typeorm';

export class addUserTagTable1632200101592 implements MigrationInterface {
  name = 'addUserTagTable1632200101592';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE user_tags (id int NOT NULL AUTO_INCREMENT, name varchar(30) NOT NULL DEFAULT '', type enum ('technology', 'club', 'qualification', 'hobby', 'other') NOT NULL DEFAULT 'technology', created_at datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), updated_at timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX IDX_55d2e54203e04661fad0d06e04 (name), PRIMARY KEY (id)) ENGINE=InnoDB`,
    );
    await queryRunner.query(`DROP TABLE user_tag_linking`);
    await queryRunner.query(
      `CREATE TABLE user_tag_linking (tag_id int NOT NULL, user_id int NOT NULL, INDEX IDX_c35bea5ccc68c0262e4a5fa4a4 (tag_id), INDEX IDX_01a49206a8279778f495cdc47b (user_id), PRIMARY KEY (tag_id, user_id)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE user_tag_linking ADD CONSTRAINT FK_c35bea5ccc68c0262e4a5fa4a40 FOREIGN KEY (tag_id) REFERENCES user_tags(id) ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE user_tag_linking ADD CONSTRAINT FK_01a49206a8279778f495cdc47b9 FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE user_tag_linking DROP FOREIGN KEY FK_01a49206a8279778f495cdc47b9`,
    );
    await queryRunner.query(
      `ALTER TABLE user_tag_linking DROP FOREIGN KEY FK_c35bea5ccc68c0262e4a5fa4a40`,
    );
    await queryRunner.query(
      `DROP INDEX IDX_01a49206a8279778f495cdc47b ON user_tag_linking`,
    );
    await queryRunner.query(
      `DROP INDEX IDX_c35bea5ccc68c0262e4a5fa4a4 ON user_tag_linking`,
    );
    await queryRunner.query(`DROP TABLE user_tag_linking`);
    await queryRunner.query(
      `CREATE TABLE user_tag_linking (tag_id int NOT NULL, user_id int NOT NULL, INDEX IDX_c35bea5ccc68c0262e4a5fa4a4 (tag_id), INDEX IDX_01a49206a8279778f495cdc47b (user_id), PRIMARY KEY (tag_id, user_id)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `DROP INDEX IDX_55d2e54203e04661fad0d06e04 ON user_tags`,
    );
    await queryRunner.query(`DROP TABLE user_tags`);
  }
}
