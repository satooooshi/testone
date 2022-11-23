import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveUniqueIndexOnReaction1639851620760
  implements MigrationInterface
{
  name = 'RemoveUniqueIndexOnReaction1639851620760';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IDX_73d44131a5315d0c0e1cfbdc8c ON chat_message_reactions`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE UNIQUE INDEX IDX_73d44131a5315d0c0e1cfbdc8c ON chat_message_reactions (emoji, user_id, chat_message_id)`,
    );
  }
}
