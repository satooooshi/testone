import { useRouter } from 'next/router';
import React from 'react';
import { useAPIGetLatestEvent } from '@/hooks/api/event/useAPIGetLatestEvent';
import { EventType } from 'src/types';
import EventIntroductionTemplate from 'src/templates/event/EventIntroduction';
import { useAPIGetEventIntroduction } from '@/hooks/api/event/useAPIGetEventIntroduction';
import impressiveUniversityImage1 from '@/public/impressive_university_1.png';
import impressiveUniversityImage2 from '@/public/impressive_university_2.png';
import { useAPISaveEventIntroduction } from '@/hooks/api/event/useAPISaveEventIntroduction';

const StudyMeeting: React.FC = () => {
  const router = useRouter();
  const type = EventType.STUDY_MEETING;
  const initialHeaderValue = {
    title: '技術勉強会',
    rightButtonName: '予定を見る',
    onClickRightButton: () =>
      router.push('/event/list?type=study_meeting&from=&to='),
  };
  const { data: recommendedEvents } = useAPIGetLatestEvent({
    type,
  });
  const { data: eventIntroduction, refetch } = useAPIGetEventIntroduction(
    EventType.STUDY_MEETING,
  );
  const { mutate: saveEventIntroduction } = useAPISaveEventIntroduction();
  const headlineImgSource =
    'https://www.bold.ne.jp/assets/assets_recruit/images/enviroment/img_univ_main.png';

  const bottomImgSources = [
    impressiveUniversityImage1,
    impressiveUniversityImage2,
  ];

  return (
    <EventIntroductionTemplate
      recommendedEvents={recommendedEvents}
      type={type}
      eventIntroduction={eventIntroduction}
      headlineImgSource={headlineImgSource}
      bottomImgSources={bottomImgSources}
      onSaveIntroduction={saveEventIntroduction}
      onSuccessToSaveIntroduction={() => refetch()}
      headerProps={initialHeaderValue}
    />
  );
};

export default StudyMeeting;
