import { useRouter } from 'next/router';
import React from 'react';
import { useAPIGetLatestEvent } from '@/hooks/api/event/useAPIGetLatestEvent';
import { EventType } from 'src/types';
import EventIntroductionTemplate from 'src/templates/event/EventIntroduction';
import { useAPIGetEventIntroduction } from '@/hooks/api/event/useAPIGetEventIntroduction';
import coachImage1 from '@/public/coach_1.jpeg';
import { useAPISaveEventIntroduction } from '@/hooks/api/event/useAPISaveEventIntroduction';

const Coach: React.FC = () => {
  const router = useRouter();
  const type = EventType.COACH;
  const initialHeaderValue = {
    title: 'コーチ制度',
    rightButtonName: '予定を見る',
    onClickRightButton: () => router.push('/event/list?type=coach&from=&to='),
  };
  const { data: recommendedEvents } = useAPIGetLatestEvent({
    type,
  });
  const { data: eventIntroduction, refetch } = useAPIGetEventIntroduction(
    EventType.COACH,
  );
  const { mutate: saveEventIntroduction } = useAPISaveEventIntroduction();

  return (
    <EventIntroductionTemplate
      recommendedEvents={recommendedEvents}
      type={type}
      eventIntroduction={eventIntroduction}
      headlineImgSource={coachImage1}
      bottomImgSources={[]}
      onSaveIntroduction={saveEventIntroduction}
      onSuccessToSaveIntroduction={() => refetch()}
      headerProps={initialHeaderValue}
    />
  );
};

export default Coach;
