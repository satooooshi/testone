import { MigrationInterface, QueryRunner } from 'typeorm';

export class addInterviewToWikiType1666007102129 implements MigrationInterface {
  name = 'addInterviewToWikiType1666007102129';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE wiki CHANGE type type enum ('rule', 'all-postal', 'board', 'mail_magazine', 'interview') NOT NULL DEFAULT 'board'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE wiki CHANGE type type enum ('rule', 'all-postal', 'board', 'mail_magazine') NOT NULL DEFAULT 'board'`,
    );
  }
}
