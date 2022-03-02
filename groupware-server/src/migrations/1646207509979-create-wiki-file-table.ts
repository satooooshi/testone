import { MigrationInterface, QueryRunner } from 'typeorm';

export class createWikiFileTable1646207509979 implements MigrationInterface {
  name = 'createWikiFileTable1646207509979';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE wiki_files (id int NOT NULL AUTO_INCREMENT, url varchar(2083) NOT NULL DEFAULT '', created_at datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), updated_at timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), wiki_id int NULL, PRIMARY KEY (id)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE wiki_files ADD CONSTRAINT FK_2b9cd5f500f4ceb41146f6b2ac4 FOREIGN KEY (wiki_id) REFERENCES wiki(id) ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE wiki_files DROP FOREIGN KEY FK_2b9cd5f500f4ceb41146f6b2ac4`,
    );
    await queryRunner.query(`DROP TABLE wiki_files`);
  }
}
