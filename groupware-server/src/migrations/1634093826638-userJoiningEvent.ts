import {MigrationInterface, QueryRunner} from "typeorm";

export class userJoiningEvent1634093826638 implements MigrationInterface {
    name = 'userJoiningEvent1634093826638'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`groupware-mysql8\`.\`user_joining_event\` DROP FOREIGN KEY \`FK_8e3906a795ab4dd368085070a36\``);
        await queryRunner.query(`ALTER TABLE \`groupware-mysql8\`.\`user_joining_event\` DROP FOREIGN KEY \`FK_fb26c4d1ce414dddb63c9957453\``);
        await queryRunner.query(`DROP INDEX \`IDX_c060ac3c2d2ba52242c74b7e52\` ON \`groupware-mysql8\`.\`wiki\``);
        await queryRunner.query(`DROP INDEX \`IDX_8e3906a795ab4dd368085070a3\` ON \`groupware-mysql8\`.\`user_joining_event\``);
        await queryRunner.query(`DROP INDEX \`IDX_fb26c4d1ce414dddb63c995745\` ON \`groupware-mysql8\`.\`user_joining_event\``);
        await queryRunner.query(`ALTER TABLE \`groupware-mysql8\`.\`user_joining_event\` ADD \`createdAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`groupware-mysql8\`.\`user_joining_event\` ADD \`updatedAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`groupware-mysql8\`.\`user_joining_event\` ADD \`canceled_at\` timestamp NULL`);
        await queryRunner.query(`ALTER TABLE \`groupware-mysql8\`.\`user_joining_event\` ADD \`late_minutes\` int NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE \`groupware-mysql8\`.\`user_joining_event\` ADD CONSTRAINT \`FK_fb26c4d1ce414dddb63c9957453\` FOREIGN KEY (\`user_id\`) REFERENCES \`groupware-mysql8\`.\`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`groupware-mysql8\`.\`user_joining_event\` ADD CONSTRAINT \`FK_8e3906a795ab4dd368085070a36\` FOREIGN KEY (\`event_id\`) REFERENCES \`groupware-mysql8\`.\`events\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`groupware-mysql8\`.\`user_joining_event\` DROP FOREIGN KEY \`FK_8e3906a795ab4dd368085070a36\``);
        await queryRunner.query(`ALTER TABLE \`groupware-mysql8\`.\`user_joining_event\` DROP FOREIGN KEY \`FK_fb26c4d1ce414dddb63c9957453\``);
        await queryRunner.query(`ALTER TABLE \`groupware-mysql8\`.\`user_joining_event\` DROP COLUMN \`late_minutes\``);
        await queryRunner.query(`ALTER TABLE \`groupware-mysql8\`.\`user_joining_event\` DROP COLUMN \`canceled_at\``);
        await queryRunner.query(`ALTER TABLE \`groupware-mysql8\`.\`user_joining_event\` DROP COLUMN \`updatedAt\``);
        await queryRunner.query(`ALTER TABLE \`groupware-mysql8\`.\`user_joining_event\` DROP COLUMN \`createdAt\``);
        await queryRunner.query(`CREATE INDEX \`IDX_fb26c4d1ce414dddb63c995745\` ON \`groupware-mysql8\`.\`user_joining_event\` (\`user_id\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_8e3906a795ab4dd368085070a3\` ON \`groupware-mysql8\`.\`user_joining_event\` (\`event_id\`)`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`IDX_c060ac3c2d2ba52242c74b7e52\` ON \`groupware-mysql8\`.\`wiki\` (\`best_answer_id\`)`);
        await queryRunner.query(`ALTER TABLE \`groupware-mysql8\`.\`user_joining_event\` ADD CONSTRAINT \`FK_fb26c4d1ce414dddb63c9957453\` FOREIGN KEY (\`user_id\`) REFERENCES \`groupware-mysql8\`.\`users\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`groupware-mysql8\`.\`user_joining_event\` ADD CONSTRAINT \`FK_8e3906a795ab4dd368085070a36\` FOREIGN KEY (\`event_id\`) REFERENCES \`groupware-mysql8\`.\`events\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
    }

}
