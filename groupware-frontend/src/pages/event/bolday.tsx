import { useRouter } from 'next/router';
import React from 'react';
import { useAPIGetLatestEvent } from '@/hooks/api/event/useAPIGetLatestEvent';
import { EventType } from 'src/types';
import { useAPIGetEventIntroduction } from '@/hooks/api/event/useAPIGetEventIntroduction';
import boldayImage1 from '@/public/bolday_1.jpg';
import boldayImage2 from '@/public/bolday_2.jpg';
import boldayImage3 from '@/public/bolday_3.jpg';
import boldayImage4 from '@/public/bolday_4.jpg';
import { useAPISaveEventIntroduction } from '@/hooks/api/event/useAPISaveEventIntroduction';
import EventIntroductionTemplate from 'src/templates/event/EventIntroduction';

const Bolday: React.FC = () => {
  const router = useRouter();
  const { data: recommendedEvents } = useAPIGetLatestEvent({
    type: EventType.BOLDAY,
  });
  const { data: eventIntroduction, refetch } = useAPIGetEventIntroduction(
    EventType.BOLDAY,
  );
  const type = EventType.BOLDAY;
  const { mutate: saveEventIntroduction } = useAPISaveEventIntroduction();

  const initialHeaderValue = {
    title: 'BOLDay',
    rightButtonName: '予定を見る',
    onClickRightButton: () => router.push('/event/list?type=bolday&from=&to='),
  };
  const headlineImgSource =
    'https://www.bold.ne.jp/assets/assets_recruit/images/enviroment/img_balday_main.png';

  const bottomImgSources = [
    boldayImage1,
    boldayImage2,
    boldayImage4,
    boldayImage3,
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

export default Bolday;
