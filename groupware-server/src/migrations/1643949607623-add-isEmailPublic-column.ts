import {MigrationInterface, QueryRunner} from "typeorm";

export class addIsEmailPublicColumn1643949607623 implements MigrationInterface {
    name = 'addIsEmailPublicColumn1643949607623'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE users ADD isEmailPublic tinyint NOT NULL DEFAULT 0`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE users DROP COLUMN isEmailPublic`);
    }

}
