import { MigrationInterface, QueryRunner } from 'typeorm';

export class createUserGoodForBordEntity1657943161312
  implements MigrationInterface
{
  name = 'createUserGoodForBordEntity1657943161312';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE user_good_for_board DROP PRIMARY KEY`);
    await queryRunner.query(
      `ALTER TABLE user_good_for_board ADD id int NOT NULL PRIMARY KEY AUTO_INCREMENT`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE user_good_for_board DROP COLUMN id`);
  }
}
