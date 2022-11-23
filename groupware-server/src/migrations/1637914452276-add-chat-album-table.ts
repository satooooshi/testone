import { MigrationInterface, QueryRunner } from 'typeorm';

export class addChatAlbumTable1637914452276 implements MigrationInterface {
  name = 'addChatAlbumTable1637914452276';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE chat_album_images (id int NOT NULL AUTO_INCREMENT, image_url varchar(2083) NOT NULL, created_at datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), updated_at timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), chat_album_id int NULL, PRIMARY KEY (id)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE chat_albums (id int NOT NULL AUTO_INCREMENT, title varchar(255) NOT NULL, created_at datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), updated_at timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), chat_group_id int NULL, PRIMARY KEY (id)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE album_user_editted (chat_album_id int NOT NULL, user_id int NOT NULL, INDEX IDX_034f0e0990e6699d8ed7d46407 (chat_album_id), INDEX IDX_6a8ab93286f318a95c328ef9c0 (user_id), PRIMARY KEY (chat_album_id, user_id)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE chat_album_images ADD CONSTRAINT FK_32ef004b36e31cfe0f26caf15e8 FOREIGN KEY (chat_album_id) REFERENCES chat_albums(id) ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE chat_albums ADD CONSTRAINT FK_01f849dc08ef581332a2881c73f FOREIGN KEY (chat_group_id) REFERENCES chat_groups(id) ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE album_user_editted ADD CONSTRAINT FK_034f0e0990e6699d8ed7d464073 FOREIGN KEY (chat_album_id) REFERENCES chat_albums(id) ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE album_user_editted ADD CONSTRAINT FK_6a8ab93286f318a95c328ef9c0a FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE album_user_editted DROP FOREIGN KEY FK_6a8ab93286f318a95c328ef9c0a`,
    );
    await queryRunner.query(
      `ALTER TABLE album_user_editted DROP FOREIGN KEY FK_034f0e0990e6699d8ed7d464073`,
    );
    await queryRunner.query(
      `ALTER TABLE chat_albums DROP FOREIGN KEY FK_01f849dc08ef581332a2881c73f`,
    );
    await queryRunner.query(
      `ALTER TABLE chat_album_images DROP FOREIGN KEY FK_32ef004b36e31cfe0f26caf15e8`,
    );
    await queryRunner.query(
      `DROP INDEX IDX_6a8ab93286f318a95c328ef9c0 ON album_user_editted`,
    );
    await queryRunner.query(
      `DROP INDEX IDX_034f0e0990e6699d8ed7d46407 ON album_user_editted`,
    );
    await queryRunner.query(`DROP TABLE album_user_editted`);
    await queryRunner.query(`DROP TABLE chat_albums`);
    await queryRunner.query(`DROP TABLE chat_album_images`);
  }
}
