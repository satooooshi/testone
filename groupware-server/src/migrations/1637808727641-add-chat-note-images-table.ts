import { MigrationInterface, QueryRunner } from 'typeorm';

export class addChatNoteImagesTable1637808727641 implements MigrationInterface {
  name = 'addChatNoteImagesTable1637808727641';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE chat_note_images (id int NOT NULL AUTO_INCREMENT, image_url varchar(2083) NOT NULL, created_at datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), updated_at timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), chat_note_id int NULL, PRIMARY KEY (id)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE chat_note_images ADD CONSTRAINT FK_154d42ffe5ea73c9b81bbc5f460 FOREIGN KEY (chat_note_id) REFERENCES chat_notes(id) ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE chat_note_images DROP FOREIGN KEY FK_154d42ffe5ea73c9b81bbc5f460`,
    );
    await queryRunner.query(`DROP TABLE chat_note_images`);
  }
}
