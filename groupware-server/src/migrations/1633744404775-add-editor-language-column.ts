import {MigrationInterface, QueryRunner} from "typeorm";

export class addEditorLanguageColumn1633744404775 implements MigrationInterface {
    name = 'addEditorLanguageColumn1633744404775'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE wiki ADD editor_language enum ('markdown', 'markup') NOT NULL DEFAULT 'markdown'`);
        await queryRunner.query(`ALTER TABLE qa_answer_replies ADD editor_language enum ('markdown', 'markup') NOT NULL DEFAULT 'markdown'`);
        await queryRunner.query(`ALTER TABLE qa_answers ADD editor_language enum ('markdown', 'markup') NOT NULL DEFAULT 'markdown'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE wiki DROP COLUMN editor_language`);
        await queryRunner.query(`ALTER TABLE qa_answers DROP COLUMN editor_language`);
        await queryRunner.query(`ALTER TABLE qa_answer_replies DROP COLUMN editor_language`);
    }

}
