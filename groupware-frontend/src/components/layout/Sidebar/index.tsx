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
import { AiFillTags, AiOutlineGlobal } from 'react-icons/ai';
import { GiCancel } from 'react-icons/gi';
import { useMediaQuery } from '@chakra-ui/media-query';
import { MdWork } from 'react-icons/md';
import { Box, Badge } from '@chakra-ui/react';
import { useHandleBadge } from 'src/contexts/badge/useHandleBadge';

export enum SidebarScreenName {
  ACCOUNT = 'アカウント',
  HOME = 'Home',
  EVENT = 'イベント',
  QA = 'Q&A',
  WIKI = '社内Wiki',
  USERS = '社員名鑑',
  CHAT = 'チャット',
  ADMIN = '管理',
  TAGADMIN = 'タグ編集',
  ATTENDANCE = '勤怠管理',
}

export type SidebarProps = {
  activeScreenName?: SidebarScreenName;
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
  const { unreadChatCount } = useHandleBadge();

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
                className={iconClass(
                  activeScreenName === SidebarScreenName.HOME,
                )}
              />
            }
            iconName={SidebarScreenName.HOME}
          />
          <LinkWithIcon
            screenName="/event/list?from=&to="
            icon={
              <BiCalendarEvent
                className={iconClass(
                  activeScreenName === SidebarScreenName.EVENT,
                )}
              />
            }
            iconName={SidebarScreenName.EVENT}
          />
          <LinkWithIcon
            screenName="/wiki"
            icon={
              <AiOutlineGlobal
                className={iconClass(activeScreenName === SidebarScreenName.QA)}
              />
            }
            iconName={SidebarScreenName.WIKI}
          />
          <LinkWithIcon
            screenName="/users/list"
            icon={
              <FaUsers
                className={iconClass(
                  activeScreenName === SidebarScreenName.USERS,
                )}
              />
            }
            iconName={SidebarScreenName.USERS}
          />
          <LinkWithIcon
            screenName="/chat"
            icon={
              <Box display="flex">
                <BsChatDotsFill
                  className={iconClass(
                    activeScreenName === SidebarScreenName.CHAT,
                  )}
                />
                {unreadChatCount > 0 && (
                  <Badge
                    bg="red"
                    color="white"
                    w="20px"
                    h="20px"
                    position="fixed"
                    borderRadius="50%"
                    textAlign="center"
                    lineHeight="20px"
                    ml="40px">
                    {unreadChatCount}
                  </Badge>
                )}
              </Box>
            }
            iconName={SidebarScreenName.CHAT}
          />
          <LinkWithIcon
            screenName={`/account/${user?.id}`}
            icon={
              <RiAccountCircleFill
                className={iconClass(
                  activeScreenName === SidebarScreenName.ACCOUNT,
                )}
              />
            }
            iconName={SidebarScreenName.ACCOUNT}
          />
          <LinkWithIcon
            screenName={`/attendance`}
            icon={
              <MdWork
                className={iconClass(
                  activeScreenName === SidebarScreenName.ATTENDANCE,
                )}
              />
            }
            iconName={SidebarScreenName.ATTENDANCE}
          />
        </div>
        {user?.role === UserRole.ADMIN ? (
          <LinkWithIcon
            screenName="/admin/users"
            icon={
              <FaUserCog
                className={iconClass(
                  activeScreenName === SidebarScreenName.ADMIN,
                )}
              />
            }
            iconName={SidebarScreenName.ADMIN}
          />
        ) : (
          <LinkWithIcon
            screenName="/admin/tag"
            icon={
              <AiFillTags
                className={iconClass(
                  activeScreenName === SidebarScreenName.TAGADMIN,
                )}
              />
            }
            iconName={SidebarScreenName.TAGADMIN}
          />
        )}
      </div>
    </>
  );
};

export default Sidebar;
