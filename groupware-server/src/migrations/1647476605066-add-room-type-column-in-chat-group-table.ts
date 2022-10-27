import { MigrationInterface, QueryRunner } from 'typeorm';

export class addRoomTypeColumnInChatGroupTable1647476605066
  implements MigrationInterface
{
  name = 'addRoomTypeColumnInChatGroupTable1647476605066';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE chat_groups ADD room_type enum ('group', 'talk_room', 'personal') NOT NULL DEFAULT 'talk_room'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE chat_groups DROP COLUMN room_type`);
  }
}
