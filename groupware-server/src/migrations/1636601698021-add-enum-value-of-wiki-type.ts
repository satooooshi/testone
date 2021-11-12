import { MigrationInterface, QueryRunner } from 'typeorm';

export class addEnumValueOfWikiType1636601698021 implements MigrationInterface {
  name = 'addEnumValueOfWikiType1636601698021';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE wiki CHANGE type type enum ('rule', 'knowledge', 'all-postal', 'qa') NOT NULL DEFAULT 'qa'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE wiki CHANGE type type enum ('rule', 'knowledge', 'qa') NOT NULL DEFAULT 'qa'`,
    );
  }
}
