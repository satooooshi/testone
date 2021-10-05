import { MigrationInterface, QueryRunner } from 'typeorm';

export class addEmployeeIdColumn1631967434039 implements MigrationInterface {
  name = 'addEmployeeIdColumn1631967434039';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE users ADD employee_id varchar(200)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE users DROP COLUMN employee_id`);
  }
}
