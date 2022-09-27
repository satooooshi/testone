import { MigrationInterface, QueryRunner } from 'typeorm';

export class updateApplicationsBeforeJoininTable1646913092718
  implements MigrationInterface
{
  name = 'updateApplicationsBeforeJoininTable1646913092718';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE applications_before_joining ADD category enum ('client', 'inhouse') NOT NULL DEFAULT 'inhouse'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE applications_before_joining DROP COLUMN category`,
    );
  }
}
