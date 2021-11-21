import LayoutWithTab from '@/components/layout/LayoutWithTab';
import { SidebarScreenName } from '@/components/layout/Sidebar';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import eventPRStyles from '@/styles/layouts/EventPR.module.scss';
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
        {editMode && eventIntroduction && (
          <EventIntroductionEditor eventIntroduction={eventIntroduction} />
        )}
        {!editMode && eventIntroduction && (
          <EventIntroductionDisplayer
            recommendedEvents={recommendedEvents}
            eventIntroduction={eventIntroduction}
          />
        )}
      </div>
    </LayoutWithTab>
  );
};

export default Club;
