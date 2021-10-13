import { MigrationInterface, QueryRunner } from 'typeorm';

export class userJoiningEvent1634097502238 implements MigrationInterface {
  name = 'userJoiningEvent1634097502238';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`groupware-mysql8\`.\`user_joining_event\` DROP FOREIGN KEY \`FK_8e3906a795ab4dd368085070a36\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`groupware-mysql8\`.\`user_joining_event\` DROP FOREIGN KEY \`FK_fb26c4d1ce414dddb63c9957453\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`groupware-mysql8\`.\`user_joining_event\` DROP PRIMARY KEY`,
    );
    await queryRunner.query(
      `ALTER TABLE \`groupware-mysql8\`.\`user_joining_event\` ADD PRIMARY KEY (\`user_id\`)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`groupware-mysql8\`.\`user_joining_event\` DROP COLUMN \`event_id\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`groupware-mysql8\`.\`user_joining_event\` DROP PRIMARY KEY`,
    );
    await queryRunner.query(
      `ALTER TABLE \`groupware-mysql8\`.\`user_joining_event\` DROP COLUMN \`user_id\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`groupware-mysql8\`.\`user_joining_event\` ADD \`userId\` int NOT NULL PRIMARY KEY`,
    );
    await queryRunner.query(
      `ALTER TABLE \`groupware-mysql8\`.\`user_joining_event\` ADD \`eventId\` int NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`groupware-mysql8\`.\`user_joining_event\` DROP PRIMARY KEY`,
    );
    await queryRunner.query(
      `ALTER TABLE \`groupware-mysql8\`.\`user_joining_event\` ADD PRIMARY KEY (\`userId\`, \`eventId\`)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`groupware-mysql8\`.\`user_joining_event\` ADD CONSTRAINT \`FK_858a3d72fb99b512e5e793250ac\` FOREIGN KEY (\`userId\`) REFERENCES \`groupware-mysql8\`.\`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`groupware-mysql8\`.\`user_joining_event\` ADD CONSTRAINT \`FK_1f96348a49f236c8004ef0adbe0\` FOREIGN KEY (\`eventId\`) REFERENCES \`groupware-mysql8\`.\`events\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`groupware-mysql8\`.\`user_joining_event\` DROP FOREIGN KEY \`FK_1f96348a49f236c8004ef0adbe0\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`groupware-mysql8\`.\`user_joining_event\` DROP FOREIGN KEY \`FK_858a3d72fb99b512e5e793250ac\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`groupware-mysql8\`.\`user_joining_event\` DROP PRIMARY KEY`,
    );
    await queryRunner.query(
      `ALTER TABLE \`groupware-mysql8\`.\`user_joining_event\` ADD PRIMARY KEY (\`userId\`)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`groupware-mysql8\`.\`user_joining_event\` DROP COLUMN \`eventId\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`groupware-mysql8\`.\`user_joining_event\` DROP COLUMN \`userId\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`groupware-mysql8\`.\`user_joining_event\` ADD \`user_id\` int NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`groupware-mysql8\`.\`user_joining_event\` ADD PRIMARY KEY (\`user_id\`)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`groupware-mysql8\`.\`user_joining_event\` ADD \`event_id\` int NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`groupware-mysql8\`.\`user_joining_event\` DROP PRIMARY KEY`,
    );
    await queryRunner.query(
      `ALTER TABLE \`groupware-mysql8\`.\`user_joining_event\` ADD PRIMARY KEY (\`event_id\`, \`user_id\`)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`groupware-mysql8\`.\`user_joining_event\` ADD CONSTRAINT \`FK_fb26c4d1ce414dddb63c9957453\` FOREIGN KEY (\`user_id\`) REFERENCES \`groupware-mysql8\`.\`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`groupware-mysql8\`.\`user_joining_event\` ADD CONSTRAINT \`FK_8e3906a795ab4dd368085070a36\` FOREIGN KEY (\`event_id\`) REFERENCES \`groupware-mysql8\`.\`events\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
