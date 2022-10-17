import { MigrationInterface, QueryRunner } from 'typeorm';

export class addUniqueIndexLastReadChatTimeTable1645686295828
  implements MigrationInterface
{
  name = 'addUniqueIndexLastReadChatTimeTable1645686295828';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM last_read_chat_time
            WHERE id NOT IN (
                SELECT id FROM(
                    SELECT * FROM last_read_chat_time AS t1
                    WHERE 1 = (
                        SELECT COUNT(*) FROM last_read_chat_time AS t2
                        WHERE t1.user_id = t2.user_id
                        AND t1.chat_group_id = t2.chat_group_id
                        AND t1.id <= t2.id
                    )
                ) AS tmp
            )`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX IDX_089c79182d9a58e79b2182107d ON last_read_chat_time (user_id, chat_group_id)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IDX_089c79182d9a58e79b2182107d ON last_read_chat_time`,
    );
  }
}
