import LayoutWithTab from '@/components/layout/LayoutWithTab';
import { SidebarScreenName } from '@/components/layout/Sidebar';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import eventPRStyles from '@/styles/layouts/EventPR.module.scss';
import { useAPIGetLatestEvent } from '@/hooks/api/event/useAPIGetLatestEvent';
import { EventType, UserRole } from 'src/types';
import Head from 'next/head';
import { useAuthenticate } from 'src/contexts/useAuthenticate';
import { Button } from '@chakra-ui/button';
import EventIntroductionEditor from 'src/templates/event/EventIntroductionEditor';
import EventIntroductionDisplayer from 'src/templates/event/EventIntroduction';
import { useAPIGetEventIntroduction } from '@/hooks/api/event/useAPIGetEventIntroduction';

const StudyMeeting: React.FC = () => {
  const router = useRouter();
  const [editMode, setEditMode] = useState<boolean>(false);
  const { user } = useAuthenticate();

  const initialHeaderValue = {
    title: '勉強会',
    rightButtonName: '予定を見る',
    onClickRightButton: () =>
      router.push('/event/list?type=study_meeting&from=&to='),
  };
  const { data: recommendedEvents } = useAPIGetLatestEvent({
    type: EventType.STUDY_MEETING,
  });
  const { data: eventIntroduction } = useAPIGetEventIntroduction(
    EventType.STUDY_MEETING,
  );

  return (
    <LayoutWithTab
      sidebar={{ activeScreenName: SidebarScreenName.EVENT }}
      header={initialHeaderValue}>
      <Head>
        <title>ボールド | 勉強会</title>
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

export default StudyMeeting;
