import { MigrationInterface, QueryRunner } from 'typeorm';

export class addTypeColumnEventTable1630041181369
  implements MigrationInterface
{
  name = 'addTypeColumnEventTable1630041181369';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE events ADD type enum ('impressive_university', 'study_meeting') NOT NULL DEFAULT 'study_meeting'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE events DROP COLUMN type`);
  }
}
