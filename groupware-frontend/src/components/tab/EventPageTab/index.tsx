import React from 'react';
import headerStyles from '@/styles/components/Header.module.scss';
import clsx from 'clsx';
import {
  Button,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
  Link,
  Box,
  Flex,
  Spacer,
} from '@chakra-ui/react';
import boldLogo from '@/public/bold-logo.png';
import Image from 'next/image';
import { GiHamburgerMenu } from 'react-icons/gi';
import { AiOutlineLeft, AiOutlinePlus } from 'react-icons/ai';
import { FiEdit2 } from 'react-icons/fi';
import { RiDeleteBin6Line } from 'react-icons/ri';
import { EventTab, Tab } from 'src/types/header/tab/types';
import { IoChevronDownCircleOutline } from 'react-icons/io5';
import { tabClassNameGetter } from '@/components/layout/HeaderWithTab';
import { hideScrollbarCss } from 'src/utils/chakra/hideScrollBar.css';

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
    <Flex
      w="100%"
      display="flex"
      flexDir="row"
      alignItems="center"
      //   overflowX="auto"
      //   css={hideScrollbarCss}
      //   overflow="hidden"
      // px="40px"
      h="60px">
      {tabs.map((t) =>
        t.type === 'create' ? (
          <Button
            onClick={t.onClick}
            rounded={50}
            colorScheme="blue"
            minW="60px"
            fontSize={13}
            h={8}
            rightIcon={<AiOutlinePlus />}>
            {t.name}
          </Button>
        ) : t.type === undefined &&
          t.onClick &&
          (t.name === 'カレンダー' || t.name === 'リスト') ? (
          <>
            <Link
              style={{ textDecoration: 'none' }}
              key={t.name}
              h="100%"
              onClick={t.onClick}
              px={4}
              //   mx={3}
              display="flex"
              alignItems="center"
              whiteSpace="nowrap"
              borderBottomColor={eventPage === t.name ? 'blue.500' : undefined}
              borderBottomWidth={eventPage === t.name ? 2 : undefined}>
              <Text
                color={eventPage === t.name ? 'blue.500' : undefined}
                fontWeight="bold">
                {t.name}
              </Text>
            </Link>
            {t.name === 'リスト' && <Spacer />}
          </>
        ) : t.type === undefined && t.onClick ? (
          <Button
            minW={`${t.name.length * 15}px`}
            fontSize={13}
            borderRadius={50}
            key={t.name}
            h={8}
            mr={2}
            colorScheme={
              t.name === activeTabName || t.isActive ? 'blue' : undefined
            }
            onClick={t.onClick}>
            {t.name}
          </Button>
        ) : null,
      )}
    </Flex>
  );
};

export default EventPageTab;
