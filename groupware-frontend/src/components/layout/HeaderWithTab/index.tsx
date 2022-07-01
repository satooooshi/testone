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
    <>
      <div className={headerStyles.header}>
        <div className={headerStyles.header_top_wrapper}>
          <div className={headerStyles.header_left}>
            <GiHamburgerMenu
              onMouseEnter={() => {
                setIsDrawerOpen(true);
              }}
              onClick={() => setIsDrawerOpen(true)}
              className={headerStyles.ham_icon}
            />
          </div>
          <div className={headerStyles.header_right}>
            <div className={headerStyles.right_button_wrapper}>
              {rightMenuName && setMembersModal && setIsTalkRoom ? (
                <Menu>
                  {({ isOpen }) => (
                    <>
                      <MenuButton
                        isActive={isOpen}
                        colorScheme="blue"
                        as={Button}
                        rightIcon={<IoChevronDownCircleOutline />}>
                        {rightMenuName}
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
              ) : null}
              {rightButtonName && onClickRightButton ? (
                <Button
                  size="sm"
                  colorScheme="blue"
                  onClick={onClickRightButton}>
                  {rightButtonName}
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      </div>
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
          px="3%"
          overflowX="auto"
          display="flex"
          flexDir="row"
          alignItems="center"
          // px="40px"
          h="60px"
          bg={tabs[0].type === 'backButton' ? '#f3f6fb' : 'white'}
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
            ) : t.type === 'link' ? (
              <Link key={t.name} href={t.href}>
                <a
                  className={clsx(
                    headerStyles.tab,
                    tabClassNameGetter(t),
                    t.name === activeTabName
                      ? headerStyles.tab__active
                      : headerStyles.tab__disable,
                  )}>
                  <Text color={t.color}>{t.name}</Text>
                </a>
              </Link>
            ) : t.type === 'create' && t.onClick ? (
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
            ) : (t.type === 'edit' || t.type === 'delete') && t.onClick ? (
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
            ) : !t.type && t.onClick ? (
              <ChakraLink
                style={{ textDecoration: 'none' }}
                key={t.name}
                h="100%"
                onClick={t.onClick}
                px={3}
                //   mx={3}
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
            ) : // <button
            //   onClick={t.onClick}
            //   key={t.name}
            //   className={clsx(
            //     headerStyles.tab,
            //     headerStyles.tab__button,
            //     tabClassNameGetter(t),
            //     t.name === activeTabName
            //       ? headerStyles.tab__active
            //       : headerStyles.tab__disable,
            //   )}>
            //   <Text color={t.color}>{t.name} </Text>
            // </button>
            null,
          )}
        </Box>
      ) : null}
    </>
  );
};

export default HeaderWithTab;
