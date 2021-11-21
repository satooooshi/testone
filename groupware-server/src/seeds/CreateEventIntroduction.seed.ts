import { EventType } from 'src/entities/event.entity';
import { EventIntroduction } from 'src/entities/eventIntroduction.entity';
import { Connection } from 'typeorm';
import { Factory, Seeder } from 'typeorm-seeding';

export default class CreateEventIntroduction implements Seeder {
  public async run(factory: Factory, connection: Connection): Promise<void> {
    // await connection.getRepository(EventIntroduction).clear();
    const isExistInitEventIntroduction = await connection
      .getRepository(EventIntroduction)
      .findOne();

    if (!isExistInitEventIntroduction) {
      // 初期値をインサート
      await connection
        .createQueryBuilder()
        .insert()
        .into(EventIntroduction)
        .values([
          {
            type: EventType.IMPRESSIVE_UNIVERSITY,
            title: '技術力と人間力を\n毎日プロから学ぶことが出来る研修制度',
            description:
              '外部講師を招へいし、社員向けに毎日研修を開講しております。技術力はもちろん、マネジメントやコミュニケーション等の人間力に関する研修もエンジニア向けの独自のカリキュラムを企画しております。社員の参加率は、常時75%となっており、多くの社員が自己研鑽の面で活用しています。講座数は、年間で200講座程となっており、お客様から頂く声を基にカリキュラムを作成しております。',
            imageUrl:
              'https://www.bold.ne.jp/assets/assets_recruit/images/enviroment/img_univ_main.png',
            // imageUrlSub1:
            //   'https://storage.googleapis.com/groupware-bucket-development/1637378765645/impressive_university_1.png',
            // imageUrlSub2:
            //   'https://storage.googleapis.com/groupware-bucket-development/1637378770502/impressive_university_2.png',
            // imageUrlSub3: '',
            // imageUrlSub4: '',
            createdAt: new Date(),
          },
          {
            type: EventType.STUDY_MEETING,
            title: '社員同士が教え合いながら、\n知識を深めていく勉強会',
            description:
              '各分野に強みを持つベテラン社員が講師となり、8つの勉強会を毎月開催しております。実機環境も完備しており、実践的に学習を進めます。講師を務める社員も、他社員への教育を通して自身の知見を更に深める事が出来ます。毎月の定例の勉強会以外にも、より理解度を高める為に補講を行うこともあります。教え合う風土は、プロジェクト先でのチームワークにも良い影響を与えています。',
            imageUrl:
              'https://www.bold.ne.jp/assets/assets_recruit/images/enviroment/img_studygroup_main.png',
            // imageUrlSub1:
            //   'https://storage.googleapis.com/groupware-bucket-development/1637378894978/study_meeting_1.jpg',
            // imageUrlSub2:
            //   'https://storage.googleapis.com/groupware-bucket-development/1637378899485/study_meeting_2.jpg',
            createdAt: new Date(),
          },
          {
            type: EventType.BOLDAY,
            title: '社員同士が高めあう風土が生まれる帰社日',
            description:
              '月に一度全社員が一堂に会する帰社日『BOLDay』を開催し、社員同士の繋がりを深めています。様々なプロジェクトで活躍する社員同士がコミュニケーションをとることが出来る場となっており、社員それぞれが持つノウハウの共有が行われます。また、BOLDayではゲストを招へいしワークショップを行ったり、様々なテーマを基にグループワークを行ったりする為、社員にとって自己研鑽の場としても活用されています。社員数が何名になっても全社員で開催していきたいと考えております。',
            imageUrl:
              'https://www.bold.ne.jp/assets/assets_recruit/images/enviroment/img_balday_main.png',
            // imageUrlSub1:
            //   'https://storage.googleapis.com/groupware-bucket-development/1637378512243/bolday_1.jpg',
            // imageUrlSub2:
            //   'https://storage.googleapis.com/groupware-bucket-development/1637378521513/bolday_2.jpg',
            // imageUrlSub3:
            //   'https://storage.googleapis.com/groupware-bucket-development/1637378525371/bolday_3.jpg',
            // imageUrlSub4:
            //   'https://storage.googleapis.com/groupware-bucket-development/1637378530305/bolday_4.jpg',
            createdAt: new Date(),
          },
          {
            type: EventType.COACH,
            title: 'エキスパート陣が社員一人ひとりを\nマンツーマンでサポート',
            description:
              '大手メーカーやSIにてエンジニアの経験を積み、豊富なマネジメント経験を持つ、アクティブシニアを専任コーチとして再雇用し、社員のスキルアップや現場でのパフォーマンスの最大化を目的にマンツーマンのサポート体制を構築しています。現場経験の豊富なエキスパート陣が、様々な視点から社員へアドバイスや指導を行う事により、お客様へ最高のサービスが実現出来ています。テクニカル面だけでなくメンタルケアの観点からも社員のパフォーマンスに良い影響を与えています。',
            imageUrl:
              'https://storage.googleapis.com/groupware-bucket-development/1637378677895/coach_1.jpeg',
            // imageUrlSub1: '',
            // imageUrlSub2: '',
            // imageUrlSub3: '',
            // imageUrlSub4: '',
            createdAt: new Date(),
          },
          {
            type: EventType.CLUB,
            title: '31の部活動、サークル',
            description:
              'ボールドでは現在、ボルダリング、バスケ、バドミントンといった運動系の部活をはじめ、麻雀、アナログゲーム、写真といった文化系など、全部で17の部活と14のサークルがあり、月1程度で週末に集まって活動しています。（ちなみに時々新しいサークルが生まれ、だんだんと増え続けています。先日は囲碁・将棋サークルが発足しました）メンバーはもちろん、その部に所属していない人も自由に参加できるので、毎回違うメンバーで盛り上がっています！',
            imageUrl:
              'https://storage.googleapis.com/groupware-bucket-development/1637377016631/club_5.jpg',
            // imageUrlSub1:
            //   'https://storage.googleapis.com/groupware-bucket-development/1637377008205/club_3.png',
            // imageUrlSub2:
            //   'https://storage.googleapis.com/groupware-bucket-development/1637377012334/club_4.jpg',
            // imageUrlSub3:
            //   'https://storage.googleapis.com/groupware-bucket-development/1637377020446/club_6.jpg',
            // imageUrlSub4:
            //   'https://storage.googleapis.com/groupware-bucket-development/1637376999970/club_2.jpg',
            createdAt: new Date(),
          },
        ])
        .execute();

      await connection.getRepository(EventIntroduction);
      return;
    }
  }
}
