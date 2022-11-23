import { MigrationInterface, QueryRunner } from 'typeorm';

export class fixRelationEventChat1634291050026 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE chat_groups DROP FOREIGN KEY FK_43f7705b7297ca296329e506ea4`,
    );
    await queryRunner.query(
      `ALTER TABLE chat_groups ADD CONSTRAINT FK_43f7705b7297ca296329e506ea4 FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE SET NULL ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE chat_groups DROP FOREIGN KEY FK_43f7705b7297ca296329e506ea4`,
    );
    await queryRunner.query(
      `ALTER TABLE chat_groups ADD CONSTRAINT FK_43f7705b7297ca296329e506ea4 FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE NO ACTION ON UPDATE CASCADE`,
    );
  }
}
