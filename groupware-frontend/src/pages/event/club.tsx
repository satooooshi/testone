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
import { EventTab } from 'src/types/header/tab/types';
import EventIntroduction from 'src/templates/event/EventIntroduction';
import Head from 'next/head';
import { Button } from '@chakra-ui/button';
import { useAuthenticate } from 'src/contexts/useAuthenticate';
import EventIntroductionEditor from 'src/templates/event/EventIntroductionEditor';

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

  const headlineImgSource = clubImage5;

  const bottomImgSources = [clubImage3, clubImage4, clubImage6, clubImage2];

  const subHeading = '31の部活動、サークル';
  const content = `ボールドでは現在、ボルダリング、バスケ、バドミントンといった運動系の部活をはじめ、麻雀、アナログゲーム、写真といった文化系など、全部で17の部活と14のサークルがあり、月1程度で週末に集まって活動しています。
（ちなみに時々新しいサークルが生まれ、だんだんと増え続けています。先日は囲碁・将棋サークルが発足しました）
メンバーはもちろん、その部に所属していない人も自由に参加できるので、毎回違うメンバーで盛り上がっています！`;

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
            headlineImgSource={headlineImgSource}
            bottomImgSources={bottomImgSources}
            heading={EventTab.CLUB}
            subHeading={subHeading}
            content={content}
          />
        ) : (
          <EventIntroduction
            recommendedEvents={recommendedEvents}
            headlineImgSource={headlineImgSource}
            bottomImgSources={bottomImgSources}
            heading={EventTab.CLUB}
            subHeading={subHeading}
            content={content}
          />
        )}
      </div>
    </LayoutWithTab>
  );
};

export default Club;
