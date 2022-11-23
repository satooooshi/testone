import { MigrationInterface, QueryRunner } from 'typeorm';

export class addTravelCostCategoryColumn1642319768851
  implements MigrationInterface
{
  name = 'addTravelCostCategoryColumn1642319768851';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE travel_cost ADD category enum ('client', 'inhouse') NOT NULL DEFAULT 'inhouse'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE travel_cost DROP COLUMN category`);
  }
}
