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
} from '@chakra-ui/react';
import boldLogo from '@/public/bold-logo.png';
import Image from 'next/image';
import { GiHamburgerMenu } from 'react-icons/gi';
import Link from 'next/link';
import { EventTab, Tab } from 'src/types/header/tab/types';
import { IoChevronDownCircleOutline } from 'react-icons/io5';

export type HeaderProps = {
  title: string;
  activeTabName?: string;
  tabs?: Tab[];
  rightButtonName?: string;
  rightMenuName?: string;
  onClickRightButton?: () => void;
  classNames?: string[];
  isDrawerOpen: boolean;
  setIsDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setIsTalkRoom?: React.Dispatch<React.SetStateAction<boolean>>;
  setMembersModal?: React.Dispatch<React.SetStateAction<boolean>>;
};

const tabClassNameGetter = (tab: Tab): string => {
  const name = tab.name;
  switch (name) {
    case EventTab.STUDY_MEETING:
      return headerStyles.study_meeting_tab;
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
  title,
  activeTabName,
  tabs,
  rightButtonName,
  rightMenuName,
  onClickRightButton,
  isDrawerOpen,
  setIsDrawerOpen,
  setIsTalkRoom,
  setMembersModal,
}) => {
  return (
    <div className={headerStyles.header_and_tab_wrapper}>
      <div className={headerStyles.header}>
        <div className={headerStyles.header_top_wrapper}>
          <div className={headerStyles.header_left}>
            <Link href="/">
              <a className={headerStyles.logo_image}>
                <Image src={boldLogo} alt="bold logo" />
              </a>
            </Link>
            <h1 className={headerStyles.header_title}>{title}</h1>
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
            {!isDrawerOpen && (
              <GiHamburgerMenu
                onClick={() => setIsDrawerOpen(true)}
                className={headerStyles.ham_icon}
              />
            )}
          </div>
        </div>
      </div>
      {tabs && tabs.length ? (
        <div className={headerStyles.tab_wrapper}>
          {tabs.map((t) =>
            t.type === 'link' ? (
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
            ) : (
              <button
                onClick={t.onClick}
                key={t.name}
                className={clsx(
                  headerStyles.tab,
                  headerStyles.tab__button,
                  tabClassNameGetter(t),
                  t.name === activeTabName
                    ? headerStyles.tab__active
                    : headerStyles.tab__disable,
                )}>
                <Text color={t.color}>{t.name}</Text>
              </button>
            ),
          )}
        </div>
      ) : null}
    </div>
  );
};

export default HeaderWithTab;
