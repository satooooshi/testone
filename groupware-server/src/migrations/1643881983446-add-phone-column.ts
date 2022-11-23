import {MigrationInterface, QueryRunner} from "typeorm";

export class addPhoneColumn1643881983446 implements MigrationInterface {
    name = 'addPhoneColumn1643881983446'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE users ADD phone varchar(100) NULL DEFAULT ''`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE users DROP COLUMN phone`);
    }

}
