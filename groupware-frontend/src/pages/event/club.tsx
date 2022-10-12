import { useRouter } from 'next/router';
import React from 'react';
import { useAPIGetLatestEvent } from '@/hooks/api/event/useAPIGetLatestEvent';
import { EventType } from 'src/types';
import { useAPIGetEventIntroduction } from '@/hooks/api/event/useAPIGetEventIntroduction';
import clubImage2 from '@/public/club_2.jpg';
import clubImage3 from '@/public/club_3.jpg';
import clubImage4 from '@/public/club_4.jpg';
import clubImage5 from '@/public/club_5.jpg';
import clubImage6 from '@/public/club_6.jpg';
import { useAPISaveEventIntroduction } from '@/hooks/api/event/useAPISaveEventIntroduction';
import EventIntroductionTemplate from 'src/templates/event/EventIntroduction';

const Club: React.FC = () => {
  const router = useRouter();
  const initialHeaderValue = {
    title: '部活動',
    rightButtonName: '予定を見る',
    onClickRightButton: () => router.push('/event/list?type=club&from=&to='),
  };
  const type = EventType.CLUB;
  const { data: recommendedEvents } = useAPIGetLatestEvent({
    type,
  });
  const { data: eventIntroduction, refetch } = useAPIGetEventIntroduction(
    EventType.CLUB,
  );
  const headlineImgSource = clubImage5;
  const bottomImgSources = [clubImage3, clubImage4, clubImage6, clubImage2];
  const { mutate: saveEventIntroduction } = useAPISaveEventIntroduction();

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

export default Club;
