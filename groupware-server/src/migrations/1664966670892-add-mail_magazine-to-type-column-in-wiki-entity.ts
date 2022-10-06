import { MigrationInterface, QueryRunner } from 'typeorm';

export class addMailMagazineToTypeColumnInWikiEntity1664966670892
  implements MigrationInterface
{
  name = 'addMailMagazineToTypeColumnInWikiEntity1664966670892';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE wiki CHANGE type type enum ('rule', 'all-postal', 'board', 'mail_magazine') NOT NULL DEFAULT 'board'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE wiki CHANGE type type enum ('rule', 'all-postal', 'board') NOT NULL DEFAULT 'board'`,
    );
  }
}
