import { MigrationInterface, QueryRunner } from 'typeorm';

export class addWikiTypeColumn1632903566845 implements MigrationInterface {
  name = 'addWikiTypeColumn1632903566845';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE qa_questions ADD type enum ('rule', 'knwoledge', 'qa') NOT NULL DEFAULT 'qa'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE qa_questions DROP COLUMN type`);
  }
}
