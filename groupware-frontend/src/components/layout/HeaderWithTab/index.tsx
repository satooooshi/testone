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
  Link as ChakraLink,
  Box,
} from '@chakra-ui/react';
import { GiHamburgerMenu } from 'react-icons/gi';
import { AiOutlineLeft, AiOutlinePlus } from 'react-icons/ai';
import { FiEdit2 } from 'react-icons/fi';
import { RiDeleteBin6Line } from 'react-icons/ri';
import Link from 'next/link';
import { EventTab, Tab } from 'src/types/header/tab/types';
import { IoChevronDownCircleOutline } from 'react-icons/io5';
import EventPageTab from '@/components/tab/EventPageTab';
import { hideScrollbarCss } from 'src/utils/chakra/hideScrollBar.css';

export type HeaderProps = {
  title: string;
  activeTabName?: string;
  tabs?: Tab[];
  rightButtonName?: string;
  rightMenuName?: string;
  onClickRightButton?: () => void;
  classNames?: string[];
  isDrawerOpen: boolean;
  EventPage?: 'カレンダー' | 'リスト';
  setIsDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setIsTalkRoom?: React.Dispatch<React.SetStateAction<boolean>>;
  setMembersModal?: React.Dispatch<React.SetStateAction<boolean>>;
};

export const tabClassNameGetter = (tab: Tab): string => {
  const name = tab.name;
  switch (name) {
    case EventTab.IMPRESSIVE_UNIVERSITY:
      return headerStyles.impressive_university_tab;
    case EventTab.STUDY_MEETING:
      return headerStyles.study_meeting_tab;
    case EventTab.BOLDAY:
      return headerStyles.bolday_tab;
    case EventTab.COACH:
      return headerStyles.coach_tab;
    case EventTab.CLUB:
      return headerStyles.club_tab;
    case EventTab.SUBMISSION_ETC:
      return headerStyles.submission_etc_tab;
    default:
      return '';
  }
};

const HeaderWithTab: React.FC<HeaderProps> = ({
  activeTabName,
  tabs,
  EventPage,
  rightButtonName,
  rightMenuName,
  onClickRightButton,
  setIsDrawerOpen,
  setIsTalkRoom,
  setMembersModal,
}) => {
  return (
    <Box
      w="100%"
      bg={tabs?.[0]?.type === 'backButton' ? '#f3f6fb' : 'white'}
      display="flex"
      flexDir="row"
      alignItems="center"

      // borderLeftWidth="3px"
      // borderColor="#f3f6fb"
    >
      <Box>
        <GiHamburgerMenu
          onMouseEnter={() => {
            setIsDrawerOpen(true);
          }}
          onClick={() => setIsDrawerOpen(true)}
          className={headerStyles.ham_icon}
        />
      </Box>
      <Box
        w="100%"
        mx="auto"
        maxW="1700px"
        px="4%"
        overflowX="auto"
        css={hideScrollbarCss}
        display="flex"
        flexDir="row"
        alignItems="center">
        {setMembersModal && setIsTalkRoom ? (
          <Box
            w="100%"
            h="60px"
            display="flex"
            flexDir="row"
            alignItems="center">
            <Menu>
              {({ isOpen }) => (
                <>
                  <MenuButton
                    isActive={isOpen}
                    colorScheme="blue"
                    as={Button}
                    rounded={50}
                    // right={0}
                    ml="auto"
                    mr="3%"
                    rightIcon={<AiOutlinePlus />}>
                    作成
                  </MenuButton>
                  <MenuList>
                    <MenuItem
                      onClick={() => {
                        setMembersModal(true), setIsTalkRoom(true);
                      }}>
                      トーク
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        setMembersModal(true), setIsTalkRoom(false);
                      }}>
                      グループ
                    </MenuItem>
                  </MenuList>
                </>
              )}
            </Menu>
          </Box>
        ) : null}

        {EventPage && tabs && (
          <EventPageTab
            tabs={tabs}
            activeTabName={activeTabName}
            eventPage={EventPage}
          />
        )}
        {tabs && tabs.length && !EventPage ? (
          <Box
            w="100%"
            overflowX="auto"
            display="flex"
            flexDir="row"
            alignItems="center"
            // px="40px"
            h="60px"
            css={hideScrollbarCss}
            justifyContent={
              tabs[0].type === 'backButton' ? 'flex-end' : 'flex-start'
            }>
            {tabs.map((t) =>
              t.type === 'backButton' ? (
                <ChakraLink
                  mr="auto"
                  key={t.name}
                  href={t.href}
                  _hover={{ textDecoration: 'none' }}>
                  <Button leftIcon={<AiOutlineLeft />} bg="white">
                    {t.name}
                  </Button>
                </ChakraLink>
              ) : t.type === 'create' ? (
                <Button
                  onClick={t.onClick}
                  rounded={50}
                  colorScheme="blue"
                  right={0}
                  ml="auto"
                  mr="3%"
                  rightIcon={<AiOutlinePlus />}>
                  {t.name}
                </Button>
              ) : t.type === 'edit' || t.type === 'delete' ? (
                <Button
                  onClick={t.onClick}
                  ml="10px"
                  leftIcon={
                    t.type === 'edit' ? (
                      <FiEdit2 />
                    ) : (
                      <RiDeleteBin6Line size="20px" />
                    )
                  }
                  bg="white">
                  {t.name}
                </Button>
              ) : !t.type ? (
                <ChakraLink
                  style={{ textDecoration: 'none' }}
                  key={t.name}
                  h="100%"
                  href={t.href}
                  onClick={t.onClick}
                  px={3}
                  display="flex"
                  alignItems="center"
                  whiteSpace="nowrap"
                  borderBottomColor={
                    t.name === activeTabName ? 'blue.500' : undefined
                  }
                  borderBottomWidth={t.name === activeTabName ? 2 : undefined}>
                  <Text
                    color={t.name === activeTabName ? 'blue.500' : undefined}
                    fontWeight="bold">
                    {t.name}
                  </Text>
                </ChakraLink>
              ) : null,
            )}
          </Box>
        ) : null}
      </Box>
    </Box>
  );
};

export default HeaderWithTab;
