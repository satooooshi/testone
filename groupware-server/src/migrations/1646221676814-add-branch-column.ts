import { MigrationInterface, QueryRunner } from 'typeorm';

export class addBranchColumn1646221676814 implements MigrationInterface {
  name = 'addBranchColumn1646221676814';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE users ADD branch enum ('tokyo', 'osaka', 'non_set') NOT NULL DEFAULT 'non_set'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE users DROP COLUMN branch`);
  }
}
