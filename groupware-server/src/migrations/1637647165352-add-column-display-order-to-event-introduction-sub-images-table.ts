import { MigrationInterface, QueryRunner } from 'typeorm';

export class addColumnDisplayOrderToEventIntroductionSubImagesTable1637647165352
  implements MigrationInterface
{
  name = 'addColumnDisplayOrderToEventIntroductionSubImagesTable1637647165352';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE event_introduction_sub_images ADD display_order int NOT NULL`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX IDX_b7a55f834a5777c6a07a35a1b2 ON event_introduction_sub_images (display_order, event_introduction_id)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IDX_b7a55f834a5777c6a07a35a1b2 ON event_introduction_sub_images`,
    );
    await queryRunner.query(
      `ALTER TABLE event_introduction_sub_images DROP COLUMN display_order`,
    );
  }
}
