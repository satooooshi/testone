import LayoutWithTab from '@/components/layout/LayoutWithTab';
import { SidebarScreenName } from '@/components/layout/Sidebar';
import { useRouter } from 'next/router';
import React from 'react';
import eventPRStyles from '@/styles/layouts/EventPR.module.scss';
import impressiveUniversityImage1 from '@/public/impressive_university_1.png';
import impressiveUniversityImage2 from '@/public/impressive_university_2.png';
import { useAPIGetLatestEvent } from '@/hooks/api/event/useAPIGetLatestEvent';
import { EventType } from 'src/types';
import { EventTab } from 'src/types/header/tab/types';
import EventIntroduction from 'src/templates/event/EventIntroduction';

const ImpressionUniversity: React.FC = () => {
  const router = useRouter();
  const initialHeaderValue = {
    title: '感動大学',
    rightButtonName: '予定を見る',
    onClickRightButton: () =>
      router.push('/event/list?type=impressive_university&from=&to='),
  };
  const { data: recommendedEvents } = useAPIGetLatestEvent({
    type: EventType.IMPRESSIVE_UNIVERSITY,
  });

  const headlineImgSource =
    'https://www.bold.ne.jp/assets/assets_recruit/images/enviroment/img_univ_main.png';

  const bottomImgSources = [
    impressiveUniversityImage1,
    impressiveUniversityImage2,
  ];

  const subHeading = '技術力と人間力を\n毎日プロから学ぶことが出来る研修制度';
  const content = `外部講師を招へいし、社員向けに毎日研修を開講しております。技術力はもちろん、マネジメントやコミュニケーション等の人間力に関する研修もエンジニア向けの独自のカリキュラムを企画しております。
社員の参加率は、常時75％となっており、多くの社員が自己研鑽の面で活用しています。講座数は、年間で200講座程となっており、お客様から頂く声を基にカリキュラムを作成しております。`;

  return (
    <LayoutWithTab
      sidebar={{ activeScreenName: SidebarScreenName.EVENT }}
      header={initialHeaderValue}>
      <div className={eventPRStyles.main}>
        <EventIntroduction
          recommendedEvents={recommendedEvents}
          headlineImgSource={headlineImgSource}
          bottomImgSources={bottomImgSources}
          heading={EventTab.IMPRESSIVE_UNIVERSITY}
          subHeading={subHeading}
          content={content}
        />
      </div>
    </LayoutWithTab>
  );
};

export default ImpressionUniversity;
