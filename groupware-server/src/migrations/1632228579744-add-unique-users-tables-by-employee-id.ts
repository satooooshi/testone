import { MigrationInterface, QueryRunner } from 'typeorm';

export class addUniqueUsersTablesByEmployeeId1632228579744
  implements MigrationInterface
{
  name = 'addUniqueUsersTablesByEmployeeId1632228579744';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `users` ADD UNIQUE INDEX `IDX_28a486ccf1cd11f2dd859adadf` (`employee_id`)',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `users` DROP INDEX `IDX_28a486ccf1cd11f2dd859adadf`',
    );
  }
}
