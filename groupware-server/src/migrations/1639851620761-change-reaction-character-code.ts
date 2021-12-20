import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveUniqueIndexOnReaction1639851620760
  implements MigrationInterface
{
  name = 'RemoveUniqueIndexOnReaction1639851620760';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE chat_message_reactions MODIFY emoji VARCHAR(50) CHARACTER SET utf8mb4`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE chat_message_reactions MODIFY emoji VARCHAR(50) CHARACTER SET utf8mb4`,
    );
  }
}
