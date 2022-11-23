import { MigrationInterface, QueryRunner } from 'typeorm';

export class addImageUrlColumnEventTable1630042678720
  implements MigrationInterface
{
  name = 'addImageUrlColumnEventTable1630042678720';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE events ADD image_url varchar(200) NOT NULL DEFAULT ''`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE events DROP COLUMN image_url`);
  }
}
