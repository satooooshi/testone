import { MigrationInterface, QueryRunner } from 'typeorm';

export class addEventIntroductionTable1637897560889
  implements MigrationInterface
{
  name = 'addEventIntroductionTable1637897560889';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE event_introduction_sub_images (id int NOT NULL AUTO_INCREMENT, image_url varchar(500) NULL DEFAULT '', display_order int NOT NULL, created_at timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), updated_at timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), event_introduction_id int NULL, UNIQUE INDEX IDX_b7a55f834a5777c6a07a35a1b2 (display_order, event_introduction_id), PRIMARY KEY (id)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE event_introductions (id int NOT NULL AUTO_INCREMENT, type enum ('impressive_university', 'study_meeting', 'bolday', 'coach', 'club', 'submission_etc') NOT NULL DEFAULT 'study_meeting', title varchar(100) NOT NULL DEFAULT '', description longtext NOT NULL, image_url varchar(2083) NOT NULL DEFAULT '', created_at timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), updated_at timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX IDX_ad78d4c718ed0ff8d02352d8ef (type), PRIMARY KEY (id)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE event_introduction_sub_images ADD CONSTRAINT FK_032212f2525ae7ef0750d68a256 FOREIGN KEY (event_introduction_id) REFERENCES event_introductions(id) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `INSERT INTO event_introductions (type, title, description, image_url, created_at, updated_at) VALUES('impressive_university', '技術力と人間力を\n毎日プロから学ぶことが出来る研修制度', '外部講師を招へいし、社員向けに毎日研修を開講しております。技術力はもちろん、マネジメントやコミュニケーション等の人間力に関する研修もエンジニア向けの独自のカリキュラムを企画しております。社員の参加率は、常時75%となっており、多くの社員が自己研鑽の面で活用しています。講座数は、年間で200講座程となっており、お客様から頂く声を基にカリキュラムを作成しております。', '', NOW(), NOW())`,
    );
    await queryRunner.query(
      `INSERT INTO event_introductions (type, title, description, image_url, created_at, updated_at) VALUES('study_meeting', '社員同士が教え合いながら、\n知識を深めていく勉強会', '各分野に強みを持つベテラン社員が講師となり、8つの勉強会を毎月開催しております。実機環境も完備しており、実践的に学習を進めます。講師を務める社員も、他社員への教育を通して自身の知見を更に深める事が出来ます。毎月の定例の勉強会以外にも、より理解度を高める為に補講を行うこともあります。教え合う風土は、プロジェクト先でのチームワークにも良い影響を与えています。', '', NOW(), NOW())`,
    );
    await queryRunner.query(
      `INSERT INTO event_introductions (type, title, description, image_url, created_at, updated_at) VALUES('bolday', '社員同士が高めあう風土が生まれる帰社日', '月に一度全社員が一堂に会する帰社日『BOLDay』を開催し、社員同士の繋がりを深めています。様々なプロジェクトで活躍する社員同士がコミュニケーションをとることが出来る場となっており、社員それぞれが持つノウハウの共有が行われます。また、BOLDayではゲストを招へいしワークショップを行ったり、様々なテーマを基にグループワークを行ったりする為、社員にとって自己研鑽の場としても活用されています。社員数が何名になっても全社員で開催していきたいと考えております。', '', NOW(), NOW())`,
    );
    await queryRunner.query(
      `INSERT INTO event_introductions (type, title, description, image_url, created_at, updated_at) VALUES('coach', 'エキスパート陣が社員一人ひとりを\nマンツーマンでサポート', '大手メーカーやSIにてエンジニアの経験を積み、豊富なマネジメント経験を持つ、アクティブシニアを専任コーチとして再雇用し、社員のスキルアップや現場でのパフォーマンスの最大化を目的にマンツーマンのサポート体制を構築しています。現場経験の豊富なエキスパート陣が、様々な視点から社員へアドバイスや指導を行う事により、お客様へ最高のサービスが実現出来ています。テクニカル面だけでなくメンタルケアの観点からも社員のパフォーマンスに良い影響を与えています。', '', NOW(), NOW())`,
    );
    await queryRunner.query(
      `INSERT INTO event_introductions (type, title, description, image_url, created_at, updated_at) VALUES('club', '31の部活動、サークル', 'ボールドでは現在、ボルダリング、バスケ、バドミントンといった運動系の部活をはじめ、麻雀、アナログゲーム、写真といった文化系など、全部で17の部活と14のサークルがあり、月1程度で週末に集まって活動しています。（ちなみに時々新しいサークルが生まれ、だんだんと増え続けています。先日は囲碁・将棋サークルが発足しました）メンバーはもちろん、その部に所属していない人も自由に参加できるので、毎回違うメンバーで盛り上がっています！', '', NOW(), NOW())`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE event_introduction_sub_images DROP FOREIGN KEY FK_032212f2525ae7ef0750d68a256`,
    );
    await queryRunner.query(
      `DROP INDEX IDX_ad78d4c718ed0ff8d02352d8ef ON event_introductions`,
    );
    await queryRunner.query(`DROP TABLE event_introductions`);
    await queryRunner.query(
      `DROP INDEX IDX_b7a55f834a5777c6a07a35a1b2 ON event_introduction_sub_images`,
    );
    await queryRunner.query(`DROP TABLE event_introduction_sub_images`);
  }
}
