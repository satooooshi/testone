import { MigrationInterface, QueryRunner } from 'typeorm';

export class addEventHostingRelation1630401381313
  implements MigrationInterface
{
  name = 'addEventHostingRelation1630401381313';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE event_hosting (event_id int NOT NULL, host_user_id int NOT NULL, INDEX IDX_ae5bc76ef162a5fe6da1fb9837 (event_id), INDEX IDX_b5285ccce22c5c0cca1e295d4f (host_user_id), PRIMARY KEY (event_id, host_user_id)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE event_hosting ADD CONSTRAINT FK_ae5bc76ef162a5fe6da1fb98372 FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE event_hosting ADD CONSTRAINT FK_b5285ccce22c5c0cca1e295d4fb FOREIGN KEY (host_user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE event_hosting DROP FOREIGN KEY FK_b5285ccce22c5c0cca1e295d4fb`,
    );
    await queryRunner.query(
      `ALTER TABLE event_hosting DROP FOREIGN KEY FK_ae5bc76ef162a5fe6da1fb98372`,
    );
    await queryRunner.query(
      `DROP INDEX IDX_b5285ccce22c5c0cca1e295d4f ON event_hosting`,
    );
    await queryRunner.query(
      `DROP INDEX IDX_ae5bc76ef162a5fe6da1fb9837 ON event_hosting`,
    );
    await queryRunner.query(`DROP TABLE event_hosting`);
  }
}
