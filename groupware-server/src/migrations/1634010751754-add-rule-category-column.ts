import { MigrationInterface, QueryRunner } from 'typeorm';

export class addRuleCategoryColumn1634010751754 implements MigrationInterface {
  name = 'addRuleCategoryColumn1634010751754';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE wiki ADD rule_category enum ('philosophy', 'rules', 'abc', 'benefits', 'document', '') NOT NULL COMMENT 'insert empty string to this column in the case of the type is not rule' DEFAULT ''`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE wiki DROP COLUMN rule_category`);
  }
}
