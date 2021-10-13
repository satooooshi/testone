import React, { ReactNode } from 'react';
import { RiAccountCircleFill } from 'react-icons/ri';
import { HiHome } from 'react-icons/hi';
import { BiCalendarEvent } from 'react-icons/bi';
import { BsChatDotsFill } from 'react-icons/bs';
import { FaUserCog, FaUsers } from 'react-icons/fa';
import sidebarStyles from '@/styles/components/Sidebar.module.scss';
import clsx from 'clsx';
import { useAuthenticate } from 'src/contexts/useAuthenticate';
import { UserRole } from 'src/types';
import Link from 'next/link';
import { AiOutlineGlobal } from 'react-icons/ai';
import { GiCancel } from 'react-icons/gi';
import { useMediaQuery } from '@chakra-ui/media-query';

export enum ScreenName {
  ACCOUNT = 'アカウント',
  HOME = 'Home',
  EVENT = 'イベント',
  QA = 'Q&A',
  WIKI = '社内Wiki',
  USERS = '社員名鑑',
  CHAT = 'チャット',
  ADMIN = '管理',
}

export type SidebarProps = {
  activeScreenName?: ScreenName;
  isDrawerOpen?: boolean;
  hideDrawer?: () => void;
};

type LinkWithIconProps = {
  screenName: string;
  icon: ReactNode;
  iconName: string;
  isActive?: boolean;
};

export const LinkWithIcon: React.FC<LinkWithIconProps> = ({
  screenName,
  icon,
  iconName,
  isActive = false,
}) => {
  return (
    <Link href={screenName}>
      <a className={sidebarStyles.icon_with_name}>
        {icon}
        <p
          className={
            isActive
              ? sidebarStyles.icon_name__active
              : sidebarStyles.icon_name__disable
          }>
          {iconName}
        </p>
      </a>
    </Link>
  );
};

const Sidebar: React.FC<SidebarProps> = ({
  activeScreenName,
  isDrawerOpen,
  hideDrawer,
}) => {
  const iconClass = (isActive: boolean) =>
    isActive
      ? clsx(sidebarStyles.icon, sidebarStyles.icon__active)
      : clsx(sidebarStyles.icon, sidebarStyles.icon__disable);
  const { user } = useAuthenticate();
  const [isSmallerThan768] = useMediaQuery('(max-width: 768px)');

  return (
    <>
      {isDrawerOpen && (
        <GiCancel
          onClick={() => {
            if (hideDrawer) hideDrawer();
          }}
          className={sidebarStyles.cancel_icon}
        />
      )}
      <div
        className={
          isSmallerThan768
            ? clsx(
                sidebarStyles.sidebar_responsive,
                !isDrawerOpen && sidebarStyles.sidebar_responsive__disable,
              )
            : sidebarStyles.sidebar
        }>
        <div>
          <LinkWithIcon
            screenName="/"
            icon={
              <HiHome
                className={iconClass(activeScreenName === ScreenName.HOME)}
              />
            }
            iconName={ScreenName.HOME}
          />
          <LinkWithIcon
            screenName="/event/list?from=&to="
            icon={
              <BiCalendarEvent
                className={iconClass(activeScreenName === ScreenName.EVENT)}
              />
            }
            iconName={ScreenName.EVENT}
          />
          <LinkWithIcon
            screenName="/wiki"
            icon={
              <AiOutlineGlobal
                className={iconClass(activeScreenName === ScreenName.QA)}
              />
            }
            iconName={ScreenName.WIKI}
          />
          <LinkWithIcon
            screenName="/users/list"
            icon={
              <FaUsers
                className={iconClass(activeScreenName === ScreenName.USERS)}
              />
            }
            iconName={ScreenName.USERS}
          />
          <LinkWithIcon
            screenName="/chat"
            icon={
              <BsChatDotsFill
                className={iconClass(activeScreenName === ScreenName.CHAT)}
              />
            }
            iconName={ScreenName.CHAT}
          />
          <LinkWithIcon
            screenName={`/account/${user?.id}`}
            icon={
              <RiAccountCircleFill
                className={iconClass(activeScreenName === ScreenName.ACCOUNT)}
              />
            }
            iconName={ScreenName.ACCOUNT}
          />
        </div>
        {user?.role === UserRole.ADMIN && (
          <LinkWithIcon
            screenName="/admin/users"
            icon={
              <FaUserCog
                className={iconClass(activeScreenName === ScreenName.ADMIN)}
              />
            }
            iconName={ScreenName.ADMIN}
          />
        )}
      </div>
    </>
  );
};

export default Sidebar;
