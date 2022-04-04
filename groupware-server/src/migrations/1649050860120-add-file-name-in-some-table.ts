import { MigrationInterface, QueryRunner } from 'typeorm';

export class addFileNameInSomeTable1649050860120 implements MigrationInterface {
  name = 'addFileNameInSomeTable1649050860120';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE chat_messages CHANGE call_time name varchar(255) NOT NULL DEFAULT ''`,
    );
    await queryRunner.query(
      `ALTER TABLE chat_album_images ADD name varchar(2083) NOT NULL DEFAULT ''`,
    );
    await queryRunner.query(
      `ALTER TABLE chat_note_images ADD name varchar(2083) NOT NULL DEFAULT ''`,
    );
    await queryRunner.query(`ALTER TABLE chat_messages DROP COLUMN name`);
    await queryRunner.query(
      `ALTER TABLE chat_messages ADD name varchar(2083) NOT NULL DEFAULT ''`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE chat_messages DROP COLUMN name`);
    await queryRunner.query(
      `ALTER TABLE chat_messages ADD name varchar(255) NOT NULL DEFAULT ''`,
    );
    await queryRunner.query(`ALTER TABLE chat_note_images DROP COLUMN name`);
    await queryRunner.query(`ALTER TABLE chat_album_images DROP COLUMN name`);
    await queryRunner.query(
      `ALTER TABLE chat_messages CHANGE name call_time varchar(255) NOT NULL DEFAULT ''`,
    );
  }
}
