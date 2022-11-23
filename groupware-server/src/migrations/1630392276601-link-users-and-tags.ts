import { MigrationInterface, QueryRunner } from 'typeorm';

export class linkUsersAndTags1630392276601 implements MigrationInterface {
  name = 'linkUsersAndTags1630392276601';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE user_tag_linking (tag_id int NOT NULL, user_id int NOT NULL, INDEX IDX_c35bea5ccc68c0262e4a5fa4a4 (tag_id), INDEX IDX_01a49206a8279778f495cdc47b (user_id), PRIMARY KEY (tag_id, user_id)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE user_tag_linking ADD CONSTRAINT FK_c35bea5ccc68c0262e4a5fa4a40 FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE ON UPDATE CASCADE`,
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
  }
}
