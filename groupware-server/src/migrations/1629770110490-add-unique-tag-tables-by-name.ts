import { MigrationInterface, QueryRunner } from 'typeorm';

export class Test1629713399245 implements MigrationInterface {
  name = 'Test1629713399245';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `tags` ADD UNIQUE INDEX `IDX_d90243459a697eadb8ad56e909` (`name`)',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `tags` DROP INDEX `IDX_d90243459a697eadb8ad56e909`',
    );
  }
}
