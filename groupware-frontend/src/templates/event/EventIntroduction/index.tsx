import {
  EventIntroduction,
  EventSchedule,
  EventType,
  UserRole,
} from 'src/types';
import eventTypeNameFactory from 'src/utils/factory/eventTypeNameFactory';
import eventPRStyles from '@/styles/layouts/EventPR.module.scss';
import { UseMutateFunction } from 'react-query';
import { AxiosError } from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import { useToast } from '@chakra-ui/react';
import { responseErrorMsgFactory } from 'src/utils/factory/responseErrorMsgFactory';
import EventIntroductionEditor from './EventIntroductionEditor';
import EventIntroductionViewer from './EventIntroductionViewer';
import LayoutWithTab from '@/components/layout/LayoutWithTab';
import { HeaderProps } from '@/components/layout/HeaderWithTab';
import { SidebarScreenName } from '@/components/layout/Sidebar';
import Head from 'next/head';
import { useAuthenticate } from 'src/contexts/useAuthenticate';
import { Tab } from 'src/types/header/tab/types';
import { blueColor } from 'src/utils/colors';

export interface EventIntroductionProps {
  recommendedEvents?: EventSchedule[];
  type: EventType;
  eventIntroduction?: EventIntroduction;
  headlineImgSource: StaticImageData | string;
  bottomImgSources: (StaticImageData | string)[];
  onSaveIntroduction: UseMutateFunction<
    EventIntroduction,
    AxiosError,
    EventIntroduction,
    unknown
  >;
  //refetch
  onSuccessToSaveIntroduction: () => void;
  headerProps: Omit<HeaderProps, 'isDrawerOpen' | 'setIsDrawerOpen'>;
}

const EventIntroductionTemplate: React.FC<EventIntroductionProps> = ({
  recommendedEvents,
  type,
  eventIntroduction,
  headlineImgSource,
  bottomImgSources,
  onSaveIntroduction,
  onSuccessToSaveIntroduction,
  headerProps,
}) => {
  const [editMode, setEditMode] = useState<boolean>(false);
  const { user } = useAuthenticate();
  const titleInputLabelRef = useRef<HTMLDivElement | null>(null);
  const toast = useToast();

  const handleSaveIntroduction = (introduction: EventIntroduction) => {
    onSaveIntroduction(introduction, {
      onSuccess: async () => {
        toast({
          description: '紹介文を更新しました',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        setEditMode(false);
        onSuccessToSaveIntroduction();
      },
      onError: (e) => {
        const messages = responseErrorMsgFactory(e);
        toast({
          description: messages,
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      },
    });
  };
  const tabs: Tab[] =
    user?.role === UserRole.ADMIN && editMode
      ? [
          {
            name: 'キャンセル',
            onClick: () => setEditMode(false),
            color: 'red',
          },
        ]
      : user?.role === UserRole.ADMIN && !editMode
      ? [
          {
            name: '紹介文を編集',
            onClick: () => setEditMode(true),
            color: blueColor,
          },
        ]
      : [];

  useEffect(() => {
    if (editMode) {
      titleInputLabelRef.current?.scrollIntoView({
        block: 'start',
        behavior: 'smooth',
      });
    }
  }, [editMode]);

  return (
    <LayoutWithTab
      sidebar={{ activeScreenName: SidebarScreenName.EVENT }}
      header={{ ...headerProps, tabs }}>
      <Head>
        <title>りゅう鍼灸整骨院 | {eventTypeNameFactory(type)}</title>
      </Head>
      <div className={eventPRStyles.main}>
        {editMode && eventIntroduction ? (
          <EventIntroductionEditor
            ref={titleInputLabelRef}
            headlineImgSource={headlineImgSource}
            bottomImgSources={bottomImgSources}
            eventIntroduction={eventIntroduction}
            onSaveIntroduction={handleSaveIntroduction}
          />
        ) : !editMode && eventIntroduction ? (
          <EventIntroductionViewer
            headlineImgSource={headlineImgSource}
            bottomImgSources={bottomImgSources}
            recommendedEvents={recommendedEvents}
            eventIntroduction={eventIntroduction}
          />
        ) : null}
      </div>
    </LayoutWithTab>
  );
};

export default EventIntroductionTemplate;
