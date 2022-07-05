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
  Flex,
  Spacer,
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
import HeaderButton from '@/components/common/Header/HeaderButton';
import HeaderLink from '@/components/common/Header/HeaderLink';

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
        {tabs && tabs.length ? (
          <Flex
            w="100%"
            display="flex"
            flexDir="row"
            alignItems="center"
            h="60px">
            {EventPage ? (
              <EventPageTab
                tabs={tabs}
                activeTabName={activeTabName}
                eventPage={EventPage}
              />
            ) : (
              tabs.map((t) =>
                t.type === 'backButton' ? (
                  <>
                    <ChakraLink
                      key={t.name}
                      href={t.href}
                      _hover={{ textDecoration: 'none' }}>
                      <Button leftIcon={<AiOutlineLeft />} bg="white">
                        {t.name}
                      </Button>
                    </ChakraLink>
                    <Spacer />
                  </>
                ) : t.type ? (
                  <HeaderButton t={t} />
                ) : !t.type ? (
                  <HeaderLink t={t} activeTabName={activeTabName} />
                ) : null,
              )
            )}
          </Flex>
        ) : null}
      </Box>
    </Box>
  );
};

export default HeaderWithTab;
