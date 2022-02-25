import { MigrationInterface, QueryRunner } from 'typeorm';

export class addUserGoodForBoardColumn1645086347665
  implements MigrationInterface
{
  name = 'addUserGoodForBoardColumn1645086347665';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE user_good_for_board (wiki_id int NOT NULL, user_id int NOT NULL, INDEX IDX_9617162fe0bc30f03165161a0c (wiki_id), INDEX IDX_3f9098d2ec6b8fd2b9eb844ea8 (user_id), PRIMARY KEY (wiki_id, user_id)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE user_good_for_board ADD CONSTRAINT FK_9617162fe0bc30f03165161a0c6 FOREIGN KEY (wiki_id) REFERENCES wiki(id) ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE user_good_for_board ADD CONSTRAINT FK_3f9098d2ec6b8fd2b9eb844ea8c FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE user_good_for_board DROP FOREIGN KEY FK_3f9098d2ec6b8fd2b9eb844ea8c`,
    );
    await queryRunner.query(
      `ALTER TABLE user_good_for_board DROP FOREIGN KEY FK_9617162fe0bc30f03165161a0c6`,
    );
    await queryRunner.query(
      `DROP INDEX IDX_3f9098d2ec6b8fd2b9eb844ea8 ON user_good_for_board`,
    );
    await queryRunner.query(
      `DROP INDEX IDX_9617162fe0bc30f03165161a0c ON user_good_for_board`,
    );
    await queryRunner.query(`DROP TABLE user_good_for_board`);
  }
}
