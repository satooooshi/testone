import LayoutWithTab from '@/components/layout/LayoutWithTab';
import { SidebarScreenName } from '@/components/layout/Sidebar';
import { useRouter } from 'next/router';
import React from 'react';
import eventPRStyles from '@/styles/layouts/EventPR.module.scss';
import boldayImage1 from '@/public/bolday_1.jpg';
import boldayImage2 from '@/public/bolday_2.jpg';
import boldayImage3 from '@/public/bolday_3.jpg';
import boldayImage4 from '@/public/bolday_4.jpg';
import { useAPIGetLatestEvent } from '@/hooks/api/event/useAPIGetLatestEvent';
import { EventType } from 'src/types';
import { EventTab } from 'src/types/header/tab/types';
import EventIntroduction from 'src/templates/event/EventIntroduction';
import Head from 'next/head';

const Bolday: React.FC = () => {
  const router = useRouter();
  const initialHeaderValue = {
    title: 'BOLDay',
    rightButtonName: '予定を見る',
    onClickRightButton: () => router.push('/event/list?type=bolday&from=&to='),
  };
  const { data: recommendedEvents } = useAPIGetLatestEvent({
    type: EventType.BOLDAY,
  });

  const headlineImgSource =
    'https://www.bold.ne.jp/assets/assets_recruit/images/enviroment/img_balday_main.png';

  const bottomImgSources = [
    boldayImage1,
    boldayImage2,
    boldayImage4,
    boldayImage3,
  ];

  const subHeading = '社員同士が高めあう風土が生まれる帰社日';
  const content = `月に一度全社員が一堂に会する帰社日『BOLDay』を開催し、社員同士の繋がりを深めています。様々なプロジェクトで活躍する社員同士がコミュニケーションをとることが出来る場となっており、社員それぞれが持つノウハウの共有が行われます。
また、BOLDayではゲストを招へいしワークショップを行ったり、様々なテーマを基にグループワークを行ったりする為、社員にとって自己研鑽の場としても活用されています。社員数が何名になっても全社員で開催していきたいと考えております。`;

  return (
    <LayoutWithTab
      sidebar={{ activeScreenName: SidebarScreenName.EVENT }}
      header={initialHeaderValue}>
      <Head>
        <title>ボールド | BOLDay</title>
      </Head>
      <div className={eventPRStyles.main}>
        <EventIntroduction
          recommendedEvents={recommendedEvents}
          headlineImgSource={headlineImgSource}
          bottomImgSources={bottomImgSources}
          heading={EventTab.BOLDAY}
          subHeading={subHeading}
          content={content}
        />
      </div>
    </LayoutWithTab>
  );
};

export default Bolday;
