import { MigrationInterface, QueryRunner } from 'typeorm';

export class addTagType1630391633840 implements MigrationInterface {
  name = 'addTagType1630391633840';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE tags ADD type enum ('technology', 'club', 'qualification', 'hobby', 'other') NOT NULL DEFAULT 'technology'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE tags DROP COLUMN type`);
  }
}
