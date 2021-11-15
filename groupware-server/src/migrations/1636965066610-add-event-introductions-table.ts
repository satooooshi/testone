import {MigrationInterface, QueryRunner} from "typeorm";

export class addEventIntroductionsTable1636965066610 implements MigrationInterface {
    name = 'addEventIntroductionsTable1636965066610'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`groupware-mysql8\`.\`chat_groups\` DROP FOREIGN KEY \`FK_43f7705b7297ca296329e506ea4\``);
        await queryRunner.query(`DROP INDEX \`IDX_c060ac3c2d2ba52242c74b7e52\` ON \`groupware-mysql8\`.\`wiki\``);
        await queryRunner.query(`DROP INDEX \`IDX_43f7705b7297ca296329e506ea\` ON \`groupware-mysql8\`.\`chat_groups\``);
        await queryRunner.query(`CREATE TABLE \`groupware-mysql8\`.\`event_introductions\` (\`id\` int NOT NULL AUTO_INCREMENT, \`type\` enum ('impressive_university', 'study_meeting', 'bolday', 'coach', 'club', 'submission_etc') NOT NULL DEFAULT 'study_meeting', \`title\` varchar(100) NOT NULL DEFAULT '', \`description\` longtext NOT NULL, \`image_url\` varchar(500) NOT NULL DEFAULT '', \`image_url_sub_1\` varchar(500) NOT NULL DEFAULT '', \`image_url_sub_2\` varchar(500) NOT NULL DEFAULT '', \`image_url_sub_3\` varchar(500) NOT NULL DEFAULT '', \`image_url_sub_4\` varchar(500) NOT NULL DEFAULT '', \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_ad78d4c718ed0ff8d02352d8ef\` (\`type\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`groupware-mysql8\`.\`chat_groups\` ADD CONSTRAINT \`FK_43f7705b7297ca296329e506ea4\` FOREIGN KEY (\`event_id\`) REFERENCES \`groupware-mysql8\`.\`events\`(\`id\`) ON DELETE NO ACTION ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`groupware-mysql8\`.\`chat_groups\` DROP FOREIGN KEY \`FK_43f7705b7297ca296329e506ea4\``);
        await queryRunner.query(`DROP INDEX \`IDX_ad78d4c718ed0ff8d02352d8ef\` ON \`groupware-mysql8\`.\`event_introductions\``);
        await queryRunner.query(`DROP TABLE \`groupware-mysql8\`.\`event_introductions\``);
        await queryRunner.query(`CREATE UNIQUE INDEX \`IDX_43f7705b7297ca296329e506ea\` ON \`groupware-mysql8\`.\`chat_groups\` (\`event_id\`)`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`IDX_c060ac3c2d2ba52242c74b7e52\` ON \`groupware-mysql8\`.\`wiki\` (\`best_answer_id\`)`);
        await queryRunner.query(`ALTER TABLE \`groupware-mysql8\`.\`chat_groups\` ADD CONSTRAINT \`FK_43f7705b7297ca296329e506ea4\` FOREIGN KEY (\`event_id\`) REFERENCES \`groupware-mysql8\`.\`events\`(\`id\`) ON DELETE SET NULL ON UPDATE CASCADE`);
    }

}
