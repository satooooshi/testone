import {MigrationInterface, QueryRunner} from "typeorm";

export class createPhoneTable1644204209646 implements MigrationInterface {
    name = 'createPhoneTable1644204209646'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE users CHANGE phone phone varchar(100) NOT NULL DEFAULT ''`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE users CHANGE phone phone varchar(100) NULL DEFAULT ''`);
    }

}
