import {MigrationInterface, QueryRunner} from "typeorm";

export class addEditorLanguageColumn1633729032640 implements MigrationInterface {
    name = 'addEditorLanguageColumn1633729032640'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`groupware-mysql8\`.\`wiki\` ADD \`editorLanguage\` enum ('markdown', 'markup') NOT NULL DEFAULT 'markdown'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`groupware-mysql8\`.\`wiki\` DROP COLUMN \`editorLanguage\``);
    }

}
