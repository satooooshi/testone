import { MigrationInterface, QueryRunner } from 'typeorm';

export class addTopNewsTable1638941145105 implements MigrationInterface {
  name = 'addTopNewsTable1638941145105';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE top_news (id int NOT NULL AUTO_INCREMENT, title varchar(100) NOT NULL DEFAULT '', url_path varchar(255) NOT NULL DEFAULT '', created_at datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), updated_at timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (id)) ENGINE=InnoDB`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE top_news`);
  }
}
