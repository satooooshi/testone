import { MigrationInterface, QueryRunner } from 'typeorm';

export class addSelfCreatedEventsColumn1630841088213
  implements MigrationInterface
{
  name = 'addSelfCreatedEventsColumn1630841088213';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE events ADD author_id int NULL`);
    await queryRunner.query(
      `ALTER TABLE events ADD CONSTRAINT FK_389b662d0b626b48a1ce4e2c8f8 FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE events DROP FOREIGN KEY FK_389b662d0b626b48a1ce4e2c8f8`,
    );
    await queryRunner.query(`ALTER TABLE events DROP COLUMN author_id`);
  }
}
