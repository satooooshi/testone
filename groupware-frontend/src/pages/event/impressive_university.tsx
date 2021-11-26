import { useRouter } from 'next/router';
import React from 'react';
import { useAPIGetLatestEvent } from '@/hooks/api/event/useAPIGetLatestEvent';
import { EventType } from 'src/types';
import { useAPIGetEventIntroduction } from '@/hooks/api/event/useAPIGetEventIntroduction';
import { useAPISaveEventIntroduction } from '@/hooks/api/event/useAPISaveEventIntroduction';
import impressiveUniversityImage1 from '@/public/impressive_university_1.png';
import impressiveUniversityImage2 from '@/public/impressive_university_2.png';
import EventIntroductionTemplate from 'src/templates/event/EventIntroduction';

const ImpressionUniversity: React.FC = () => {
  const router = useRouter();
  const type = EventType.IMPRESSIVE_UNIVERSITY;
  const { data: recommendedEvents } = useAPIGetLatestEvent({
    type,
  });

  const { data: eventIntroduction, refetch } = useAPIGetEventIntroduction(
    EventType.IMPRESSIVE_UNIVERSITY,
  );
  const { mutate: saveEventIntroduction } = useAPISaveEventIntroduction();
  const headlineImgSource =
    'https://www.bold.ne.jp/assets/assets_recruit/images/enviroment/img_univ_main.png';

  const bottomImgSources = [
    impressiveUniversityImage1,
    impressiveUniversityImage2,
  ];

  const initialHeaderValue = {
    title: '感動大学',
    rightButtonName: '予定を見る',
    onClickRightButton: () =>
      router.push('/event/list?type=impressive_university&from=&to='),
  };

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

export default ImpressionUniversity;
