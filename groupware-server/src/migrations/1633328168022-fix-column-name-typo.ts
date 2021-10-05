import { MigrationInterface, QueryRunner } from 'typeorm';

export class fixColumnNameTypo1633328168022 implements MigrationInterface {
  name = 'fixColumnNameTypo1633328168022';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE wiki CHANGE type type enum ('rule', 'knowledge', 'knwoledge', 'qa') NOT NULL DEFAULT 'qa'`,
    );
    await queryRunner.query(
      `UPDATE wiki SET type = 'knowledge' WHERE type = 'knwoledge'`,
    );
    await queryRunner.query(
      `ALTER TABLE wiki CHANGE type type enum ('rule', 'knowledge', 'qa') NOT NULL DEFAULT 'qa'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE wiki CHANGE type type enum ('rule', 'knowledge', 'knwoledge', 'qa') NOT NULL DEFAULT 'qa'`,
    );
    await queryRunner.query(
      `UPDATE wiki SET type = 'knwoledge' WHERE type = 'knowledge'`,
    );
    await queryRunner.query(
      `ALTER TABLE wiki CHANGE type type enum ('rule', 'knwoledge', 'qa') NOT NULL DEFAULT 'qa'`,
    );
  }
}
