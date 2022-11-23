import { MigrationInterface, QueryRunner } from 'typeorm';

export class renameRelationColumn1629095820250 implements MigrationInterface {
  name = 'renameRelationColumn1629095820250';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `event_files` CHANGE `eventScheduleId` `event_id` int NULL',
    );
    await queryRunner.query(
      'ALTER TABLE `event_videos` CHANGE `eventScheduleId` `event_id` int NULL',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `event_videos` CHANGE `event_id` `eventScheduleId` int NULL',
    );
    await queryRunner.query(
      'ALTER TABLE `event_files` CHANGE `event_id` `eventScheduleId` int NULL',
    );
  }
}
