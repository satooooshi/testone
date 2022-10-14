import React from 'react';
import { Button, Text, Link, Spacer } from '@chakra-ui/react';
import { Tab } from 'src/types/header/tab/types';
import { AiOutlinePlus } from 'react-icons/ai';
import HeaderLink from '@/components/common/Header/HeaderLink';
import HeaderButton from '@/components/common/Header/HeaderButton';

type EventPageTabProps = {
  tabs: Tab[];
  activeTabName?: string;
  eventPage: 'カレンダー' | 'リスト';
};

const EventPageTab: React.FC<EventPageTabProps> = ({
  tabs,
  activeTabName,
  eventPage,
}) => {
  return (
    <>
      {tabs.map((t) =>
        t.type === 'create' ? (
          <HeaderButton t={t} />
        ) : t.name === 'カレンダー' || t.name === 'リスト' ? (
          <>
            <HeaderLink t={t} activeTabName={eventPage} />
            {t.name === 'リスト' && <Spacer />}
          </>
        ) : (
          <Button
            minW={`${t.name.length * 15}px`}
            fontSize={13}
            borderRadius={50}
            key={t.name}
            h={8}
            mr={2}
            colorScheme={
              t.name === activeTabName || t.isActive ? 'brand' : undefined
            }
            onClick={t.onClick}>
            {t.name}
          </Button>
        ),
      )}
    </>
  );
};

export default EventPageTab;
