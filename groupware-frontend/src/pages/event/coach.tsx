import LayoutWithTab from '@/components/layout/LayoutWithTab';
import { SidebarScreenName } from '@/components/layout/Sidebar';
import { useRouter } from 'next/router';
import React from 'react';
import eventPRStyles from '@/styles/layouts/EventPR.module.scss';
import { useAPIGetLatestEvent } from '@/hooks/api/event/useAPIGetLatestEvent';
import { EventType } from 'src/types';
import { EventTab } from 'src/types/header/tab/types';
import coachImage1 from '@/public/coach_1.jpeg';
import EventIntroduction from 'src/templates/event/EventIntroduction';
import Head from 'next/head';

const Coach: React.FC = () => {
  const router = useRouter();
  const initialHeaderValue = {
    title: 'コーチ制度',
    rightButtonName: '予定を見る',
    onClickRightButton: () => router.push('/event/list?type=coach&from=&to='),
  };
  const { data: recommendedEvents } = useAPIGetLatestEvent({
    type: EventType.COACH,
  });

  const bottomImgSources = [''];

  const subHeading = `エキスパート陣が社員一人ひとりを
  マンツーマンでサポート`;
  const content = `大手メーカーやSIにてエンジニアの経験を積み、豊富なマネジメント経験を持つ、アクティブシニアを専任コーチとして再雇用し、社員のスキルアップや現場でのパフォーマンスの最大化を目的にマンツーマンのサポート体制を構築しています。現場経験の豊富なエキスパート陣が、様々な視点から社員へアドバイスや指導を行う事により、お客様へ最高のサービスが実現出来ています。テクニカル面だけでなくメンタルケアの観点からも社員のパフォーマンスに良い影響を与えています。`;

  return (
    <LayoutWithTab
      sidebar={{ activeScreenName: SidebarScreenName.EVENT }}
      header={initialHeaderValue}>
      <Head>
        <title>ボールド | コーチ制度</title>
      </Head>
      <div className={eventPRStyles.main}>
        <EventIntroduction
          recommendedEvents={recommendedEvents}
          headlineImgSource={coachImage1}
          bottomImgSources={bottomImgSources}
          heading={EventTab.COACH}
          subHeading={subHeading}
          content={content}
        />
      </div>
    </LayoutWithTab>
  );
};

export default Coach;
