import { MigrationInterface, QueryRunner } from 'typeorm';

export class fixFullTextIndex1628048190576 implements MigrationInterface {
  name = 'fixFullTextIndex1628048190576';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE FULLTEXT INDEX `IDX_89c37917874c1da3bb25ae5641` ON `qa_questions` (`title`, `body`) WITH PARSER NGRAM',
    );
    await queryRunner.query(
      'CREATE FULLTEXT INDEX `IDX_654414643bb52d1c8b2c4bd626` ON `events` (`title`, `description`) WITH PARSER NGRAM',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'DROP INDEX `IDX_654414643bb52d1c8b2c4bd626` ON `events`',
    );
    await queryRunner.query(
      'DROP INDEX `IDX_89c37917874c1da3bb25ae5641` ON `qa_questions`',
    );
  }
}
