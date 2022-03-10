import {MigrationInterface, QueryRunner} from "typeorm";

export class addIsPhonePublicColumn1643949672561 implements MigrationInterface {
    name = 'addIsPhonePublicColumn1643949672561'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE users ADD isPhonePublic tinyint NOT NULL DEFAULT 0`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE users DROP COLUMN isPhonePublic`);
    }

}
