import LayoutWithTab from '@/components/LayoutWithTab';
import { ScreenName } from '@/components/Sidebar';
import { useRouter } from 'next/router';
import React from 'react';
import eventPRStyles from '@/styles/layouts/EventPR.module.scss';
import studyMeetingImage1 from '@/public/study_meeting_1.jpg';
import studyMeetingImage2 from '@/public/study_meeting_2.jpg';
import { useAPIGetLatestEvent } from '@/hooks/api/event/useAPIGetLatestEvent';
import { EventType } from 'src/types';
import { EventTab } from 'src/types/header/tab/types';
import EventIntroduction from 'src/templates/event/EventIntroduction';

const StudyMeeting: React.FC = () => {
  const router = useRouter();
  const initialHeaderValue = {
    title: '勉強会',
    rightButtonName: '予定を見る',
    onClickRightButton: () =>
      router.push('/event/list?type=study_meeting&from=&to='),
  };
  const { data: recommendedEvents } = useAPIGetLatestEvent({
    type: EventType.STUDY_MEETING,
  });
  const headlineImgSource =
    'https://www.bold.ne.jp/assets/assets_recruit/images/enviroment/img_studygroup_main.png';

  const bottomImgSources = [studyMeetingImage1, studyMeetingImage2];

  const subHeading = `社員同士が教え合いながら、
  知識を深めていく勉強会`;
  const content = `各分野に強みを持つベテラン社員が講師となり、8つの勉強会を毎月開催しております。実機環境も完備しており、実践的に学習を進めます。講師を務める社員も、他社員への教育を通して自身の知見を更に深める事が出来ます。毎月の定例の勉強会以外にも、より理解度を高める為に補講を行うこともあります。教え合う風土は、プロジェクト先でのチームワークにも良い影響を与えています。`;

  return (
    <LayoutWithTab
      sidebar={{ activeScreenName: ScreenName.EVENT }}
      header={initialHeaderValue}>
      <div className={eventPRStyles.main}>
        <EventIntroduction
          recommendedEvents={recommendedEvents}
          headlineImgSource={headlineImgSource}
          bottomImgSources={bottomImgSources}
          heading={EventTab.STUDY_MEETING}
          subHeading={subHeading}
          content={content}
        />
      </div>
    </LayoutWithTab>
  );
};

export default StudyMeeting;
