import { MigrationInterface, QueryRunner } from 'typeorm';

export class addCascade1629366438665 implements MigrationInterface {
  name = 'addCascade1629366438665';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `event_files` DROP FOREIGN KEY `FK_4a1e8d0e254f8f33249de6ddc6e`',
    );
    await queryRunner.query(
      'ALTER TABLE `event_videos` DROP FOREIGN KEY `FK_a17ffa75b8aac2fa7ff8de78d23`',
    );
    await queryRunner.query(
      'ALTER TABLE `event_files` ADD CONSTRAINT `FK_507bab283c7f5999aacff462a5c` FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON DELETE CASCADE ON UPDATE CASCADE',
    );
    await queryRunner.query(
      'ALTER TABLE `event_videos` ADD CONSTRAINT `FK_701e412b8ee499bc160d98d6653` FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON DELETE CASCADE ON UPDATE CASCADE',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `event_videos` DROP FOREIGN KEY `FK_701e412b8ee499bc160d98d6653`',
    );
    await queryRunner.query(
      'ALTER TABLE `event_files` DROP FOREIGN KEY `FK_507bab283c7f5999aacff462a5c`',
    );
    await queryRunner.query(
      'ALTER TABLE `event_videos` ADD CONSTRAINT `FK_a17ffa75b8aac2fa7ff8de78d23` FOREIGN KEY (`event_id`) REFERENCES `events`(`id`)',
    );
    await queryRunner.query(
      'ALTER TABLE `event_files` ADD CONSTRAINT `FK_4a1e8d0e254f8f33249de6ddc6e` FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON DELETE CASCADE ON UPDATE CASCADE',
    );
  }
}
