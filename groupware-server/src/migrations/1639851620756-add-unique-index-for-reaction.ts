import { MigrationInterface, QueryRunner } from 'typeorm';

export class addUniqueIndexForReaction1639851620756
  implements MigrationInterface
{
  name = 'addUniqueIndexForReaction1639851620756';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE UNIQUE INDEX IDX_73d44131a5315d0c0e1cfbdc8c ON chat_message_reactions (emoji, user_id, chat_message_id)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IDX_73d44131a5315d0c0e1cfbdc8c ON chat_message_reactions`,
    );
  }
}
