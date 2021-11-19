import LayoutWithTab from '@/components/layout/LayoutWithTab';
import { SidebarScreenName } from '@/components/layout/Sidebar';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import eventPRStyles from '@/styles/layouts/EventPR.module.scss';
import clubImage2 from '@/public/club_2.jpg';
import clubImage3 from '@/public/club_3.png';
import clubImage4 from '@/public/club_4.jpg';
import clubImage5 from '@/public/club_5.jpg';
import clubImage6 from '@/public/club_6.jpg';
import { useAPIGetLatestEvent } from '@/hooks/api/event/useAPIGetLatestEvent';
import { EventType, UserRole } from 'src/types';
import Head from 'next/head';
import { Button } from '@chakra-ui/button';
import { useAuthenticate } from 'src/contexts/useAuthenticate';
import EventIntroductionEditor from 'src/templates/event/EventIntroductionEditor';
import { useAPIGetEventIntroduction } from '@/hooks/api/event/useAPIGetEventIntroduction';
import EventIntroductionDisplayer from 'src/templates/event/EventIntroduction';

const Club: React.FC = () => {
  const router = useRouter();
  const [editMode, setEditMode] = useState<boolean>(false);
  const { user } = useAuthenticate();

  const initialHeaderValue = {
    title: '部活動',
    rightButtonName: '予定を見る',
    onClickRightButton: () => router.push('/event/list?type=club&from=&to='),
  };
  const { data: recommendedEvents } = useAPIGetLatestEvent({
    type: EventType.CLUB,
  });
  const { data: eventIntroduction } = useAPIGetEventIntroduction(
    EventType.CLUB,
  );

  return (
    <LayoutWithTab
      sidebar={{ activeScreenName: SidebarScreenName.EVENT }}
      header={initialHeaderValue}>
      <Head>
        <title>ボールド | 部活動</title>
      </Head>
      {user?.role === UserRole.ADMIN && (
        <div className={eventPRStyles.edit_button_wrapper}>
          {!editMode && (
            <Button
              colorScheme={'green'}
              onClick={() => {
                editMode ? setEditMode(false) : setEditMode(true);
              }}>
              編集する
            </Button>
          )}
        </div>
      )}
      <div className={eventPRStyles.main}>
        {editMode ? (
          <EventIntroductionEditor
            type={eventIntroduction?.type}
            title={eventIntroduction?.title}
            description={eventIntroduction?.description}
            imageUrl={eventIntroduction?.imageUrl}
            imageUrlSub1={eventIntroduction?.imageUrlSub1}
            imageUrlSub2={eventIntroduction?.imageUrlSub2}
            imageUrlSub3={eventIntroduction?.imageUrlSub3}
            imageUrlSub4={eventIntroduction?.imageUrlSub4}
          />
        ) : (
          <EventIntroductionDisplayer
            recommendedEvents={recommendedEvents}
            type={eventIntroduction?.type}
            title={eventIntroduction?.title}
            description={eventIntroduction?.description}
            imageUrl={eventIntroduction?.imageUrl}
            imageUrlSub1={eventIntroduction?.imageUrlSub1}
            imageUrlSub2={eventIntroduction?.imageUrlSub2}
            imageUrlSub3={eventIntroduction?.imageUrlSub3}
            imageUrlSub4={eventIntroduction?.imageUrlSub4}
          />
        )}
      </div>
    </LayoutWithTab>
  );
};

export default Club;
