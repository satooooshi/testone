import {MigrationInterface, QueryRunner} from "typeorm";

export class addEditorLanguageColumn1633744354760 implements MigrationInterface {
    name = 'addEditorLanguageColumn1633744354760'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`groupware-mysql8\`.\`qa_answer_replies\` ADD \`editorLanguage\` enum ('markdown', 'markup') NOT NULL DEFAULT 'markdown'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`groupware-mysql8\`.\`qa_answer_replies\` DROP COLUMN \`editorLanguage\``);
    }

}
