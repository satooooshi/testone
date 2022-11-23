import { MigrationInterface, QueryRunner } from 'typeorm';

export class addUniqueIndexInDeviceTable1639057142973
  implements MigrationInterface
{
  name = 'addUniqueIndexInDeviceTable1639057142973';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE notification_devices ADD UNIQUE INDEX IDX_4759b5047ddef21edacf91ce74 (token)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE notification_devices DROP INDEX IDX_4759b5047ddef21edacf91ce74`,
    );
  }
}
