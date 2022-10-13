import { MigrationInterface, QueryRunner } from 'typeorm';

export class modifyUserTable1665642815550 implements MigrationInterface {
  name = 'modifyUserTable1665642815550';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE users CHANGE branch branch enum ('artist', 'idol', 'youtuber', 'tiktoker', 'instagramer', 'talent', 'other') NOT NULL DEFAULT 'other'`,
    );
    await queryRunner.query(
      `ALTER TABLE users CHANGE role role enum ('admin', 'influencer', 'common') NOT NULL DEFAULT 'common'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE users CHANGE role role enum ('admin', 'external_instructor', 'internal_instructor', 'coach', 'common') NOT NULL DEFAULT 'common'`,
    );
    await queryRunner.query(
      `ALTER TABLE users CHANGE branch branch enum ('tokyo', 'osaka', 'non_set') NOT NULL DEFAULT 'non_set'`,
    );
  }
}
