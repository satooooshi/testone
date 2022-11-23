import { MigrationInterface, QueryRunner } from 'typeorm';

export class refreshIndexes1633877170783 implements MigrationInterface {
  name = 'refreshIndexes1633877170783';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE qa_answers DROP FOREIGN KEY FK_f1dd97c91c78a40a40fc8ceec93`,
    );
    await queryRunner.query(
      `ALTER TABLE wiki_linked_tags DROP FOREIGN KEY FK_d33350a5ae857cd19a95d71eca6`,
    );
    await queryRunner.query(
      `ALTER TABLE wiki_linked_tags DROP FOREIGN KEY FK_fc4fc519580a41443ceeda6f9f2`,
    );
    await queryRunner.query(
      `DROP INDEX IDX_d33350a5ae857cd19a95d71eca ON wiki_linked_tags`,
    );
    await queryRunner.query(
      `DROP INDEX IDX_fc4fc519580a41443ceeda6f9f ON wiki_linked_tags`,
    );
    await queryRunner.query(
      `ALTER TABLE qa_answers CHANGE question_id wiki_id int NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX IDX_bce226c5366be419c65e7bafd1 ON wiki_linked_tags (wiki_id)`,
    );
    await queryRunner.query(
      `CREATE INDEX IDX_16f85469abf7951237e4df4a4a ON wiki_linked_tags (tag_id)`,
    );
    await queryRunner.query(
      `ALTER TABLE qa_answers ADD CONSTRAINT FK_80021913a2fdf021c9144c915e8 FOREIGN KEY (wiki_id) REFERENCES wiki(id) ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE wiki_linked_tags ADD CONSTRAINT FK_bce226c5366be419c65e7bafd1f FOREIGN KEY (wiki_id) REFERENCES wiki(id) ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE wiki_linked_tags ADD CONSTRAINT FK_16f85469abf7951237e4df4a4ad FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE wiki_linked_tags DROP FOREIGN KEY FK_16f85469abf7951237e4df4a4ad`,
    );
    await queryRunner.query(
      `ALTER TABLE wiki_linked_tags DROP FOREIGN KEY FK_bce226c5366be419c65e7bafd1f`,
    );
    await queryRunner.query(
      `ALTER TABLE qa_answers DROP FOREIGN KEY FK_80021913a2fdf021c9144c915e8`,
    );
    await queryRunner.query(
      `DROP INDEX IDX_16f85469abf7951237e4df4a4a ON wiki_linked_tags`,
    );
    await queryRunner.query(
      `DROP INDEX IDX_bce226c5366be419c65e7bafd1 ON wiki_linked_tags`,
    );
    await queryRunner.query(
      `ALTER TABLE qa_answers CHANGE wiki_id question_id int NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX IDX_fc4fc519580a41443ceeda6f9f ON wiki_linked_tags (wiki_id)`,
    );
    await queryRunner.query(
      `CREATE INDEX IDX_d33350a5ae857cd19a95d71eca ON wiki_linked_tags (tag_id)`,
    );
    await queryRunner.query(
      `ALTER TABLE wiki_linked_tags ADD CONSTRAINT FK_fc4fc519580a41443ceeda6f9f2 FOREIGN KEY (wiki_id) REFERENCES wiki(id) ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE wiki_linked_tags ADD CONSTRAINT FK_d33350a5ae857cd19a95d71eca6 FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE qa_answers ADD CONSTRAINT FK_f1dd97c91c78a40a40fc8ceec93 FOREIGN KEY (question_id) REFERENCES wiki(id) ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }
}
