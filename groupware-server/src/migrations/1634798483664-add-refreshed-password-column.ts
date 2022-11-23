import { MigrationInterface, QueryRunner } from 'typeorm';

export class addRefreshedPasswordColumn1634798483664
  implements MigrationInterface
{
  name = 'addRefreshedPasswordColumn1634798483664';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE chat_groups DROP FOREIGN KEY FK_43f7705b7297ca296329e506ea4`,
    );
    await queryRunner.query(
      `ALTER TABLE users ADD refreshed_password varchar(200) NOT NULL DEFAULT ''`,
    );
    await queryRunner.query(
      `ALTER TABLE chat_groups ADD CONSTRAINT FK_43f7705b7297ca296329e506ea4 FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE NO ACTION ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE chat_groups DROP FOREIGN KEY FK_43f7705b7297ca296329e506ea4`,
    );
    await queryRunner.query(`ALTER TABLE users DROP COLUMN refreshed_password`);
    await queryRunner.query(
      `ALTER TABLE chat_groups ADD CONSTRAINT FK_43f7705b7297ca296329e506ea4 FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE SET NULL ON UPDATE CASCADE`,
    );
  }
}
