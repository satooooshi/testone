import { EventType } from 'src/entities/event.entity';
import { EventIntroduction } from 'src/entities/eventIntroduction.entity';
import { Connection } from 'typeorm';
import { Factory, Seeder } from 'typeorm-seeding';

export default class CreateEventIntroduction implements Seeder {
  public async run(factory: Factory, connection: Connection): Promise<void> {
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
              'https://eowesttokyo.org/wp-content/uploads/2019/03/valleyin.jpg',
            createdAt: new Date(),
          },
          {
            type: EventType.STUDY_MEETING,
            title: '社員同士が教え合いながら、\n知識を深めていく勉強会',
            description:
              '各分野に強みを持つベテラン社員が講師となり、8つの勉強会を毎月開催しております。実機環境も完備しており、実践的に学習を進めます。講師を務める社員も、他社員への教育を通して自身の知見を更に深める事が出来ます。毎月の定例の勉強会以外にも、より理解度を高める為に補講を行うこともあります。教え合う風土は、プロジェクト先でのチームワークにも良い影響を与えています。',
            imageUrl:
              'https://eowesttokyo.org/wp-content/uploads/2019/03/valleyin.jpg',
            createdAt: new Date(),
          },
          {
            type: EventType.BOLDAY,
            title: '社員同士が高めあう風土が生まれる帰社日',
            description:
              '月に一度全社員が一堂に会する帰社日『BOLDay』を開催し、社員同士の繋がりを深めています。様々なプロジェクトで活躍する社員同士がコミュニケーションをとることが出来る場となっており、社員それぞれが持つノウハウの共有が行われます。また、BOLDayではゲストを招へいしワークショップを行ったり、様々なテーマを基にグループワークを行ったりする為、社員にとって自己研鑽の場としても活用されています。社員数が何名になっても全社員で開催していきたいと考えております。',
            imageUrl:
              'https://eowesttokyo.org/wp-content/uploads/2019/03/valleyin.jpg',
            createdAt: new Date(),
          },
          {
            type: EventType.COACH,
            title: 'エキスパート陣が社員一人ひとりを\nマンツーマンでサポート',
            description:
              'ボールドでは現在、ボルダリング、バスケ、バドミントンといった運動系の部活をはじめ、麻雀、アナログゲーム、写真といった文化系など、全部で17の部活と14のサークルがあり、月1程度で週末に集まって活動しています。（ちなみに時々新しいサークルが生まれ、だんだんと増え続けています。先日は囲碁・将棋サークルが発足しました）メンバーはもちろん、その部に所属していない人も自由に参加できるので、毎回違うメンバーで盛り上がっています！',
            imageUrl:
              'https://eowesttokyo.org/wp-content/uploads/2019/03/valleyin.jpg',
            createdAt: new Date(),
          },
          {
            type: EventType.CLUB,
            title: '31の部活動、サークル',
            description:
              'ボールドでは現在、ボルダリング、バスケ、バドミントンといった運動系の部活をはじめ、麻雀、アナログゲーム、写真といった文化系など、全部で17の部活と14のサークルがあり、月1程度で週末に集まって活動しています。（ちなみに時々新しいサークルが生まれ、だんだんと増え続けています。先日は囲碁・将棋サークルが発足しました）メンバーはもちろん、その部に所属していない人も自由に参加できるので、毎回違うメンバーで盛り上がっています！',
            imageUrl:
              'https://eowesttokyo.org/wp-content/uploads/2019/03/valleyin.jpg',
            createdAt: new Date(),
          },
        ])
        .execute();
      return;
    }
  }
}
