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
import { AiFillTags, AiOutlineGlobal, AiOutlineRight } from 'react-icons/ai';
import { Box, Badge, Avatar, Text } from '@chakra-ui/react';
import { useHandleBadge } from 'src/contexts/badge/useHandleBadge';
import { AiOutlineDoubleLeft } from 'react-icons/ai';
import Image from 'next/image';
import boldLogo from '@/public/bold-logo.png';
import router from 'next/router';
import { darkFontColor } from 'src/utils/colors';

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
}

export type SidebarProps = {
  activeScreenName?: SidebarScreenName;
  isDrawerOpen?: boolean;
  hideDrawer: () => void;
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
      <a
        className={
          isActive
            ? sidebarStyles.icon_with_name__active
            : sidebarStyles.icon_with_name__disable
        }>
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

const Sidebar: React.FC<SidebarProps> = ({ activeScreenName, hideDrawer }) => {
  const iconClass = (isActive: boolean) =>
    isActive
      ? clsx(sidebarStyles.icon, sidebarStyles.icon__active)
      : clsx(sidebarStyles.icon, sidebarStyles.icon__disable);
  const { user } = useAuthenticate();
  const { unreadChatCount } = useHandleBadge();

  return (
    <>
      <div className={sidebarStyles.sidebar}>
        <div>
          <div className={sidebarStyles.top_item}>
            <div className={sidebarStyles.bold_logo_and_text}>
              <div className={sidebarStyles.bold_logo}>
                <Image src={boldLogo} alt="bold logo" />
              </div>
              <p className={sidebarStyles.logo_text}>Bold</p>
            </div>
            <AiOutlineDoubleLeft
              className={sidebarStyles.outline_double_left}
              onClick={hideDrawer}
            />
          </div>

          <LinkWithIcon
            screenName="/"
            isActive={activeScreenName === SidebarScreenName.HOME}
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
            isActive={activeScreenName === SidebarScreenName.EVENT}
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
            screenName="/wiki/list?page=1&tag=&word=&status=undefined&type="
            isActive={activeScreenName === SidebarScreenName.QA}
            icon={
              <AiOutlineGlobal
                className={iconClass(activeScreenName === SidebarScreenName.QA)}
              />
            }
            iconName={SidebarScreenName.WIKI}
          />
          <LinkWithIcon
            screenName="/users/list"
            isActive={activeScreenName === SidebarScreenName.USERS}
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
            isActive={activeScreenName === SidebarScreenName.CHAT}
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
            isActive={activeScreenName === SidebarScreenName.ACCOUNT}
            icon={
              <RiAccountCircleFill
                className={iconClass(
                  activeScreenName === SidebarScreenName.ACCOUNT,
                )}
              />
            }
            iconName={SidebarScreenName.ACCOUNT}
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
        <div
          className={sidebarStyles.login_user_item}
          onClick={() => {
            router.push(`/account/${user?.id}`);
          }}>
          <div className={sidebarStyles.login_user_name_with_icon}>
            <Avatar
              size="xl"
              src={user?.avatarUrl}
              className={sidebarStyles.login_user_icon}
              width={'40px'}
              height={'40px'}
            />
            <Text color="black" fontWeight="bold">
              {user?.lastName} {user?.firstName}
            </Text>
          </div>
          <AiOutlineRight size={20} color={darkFontColor} />
        </div>
      </div>
    </>
  );
};

export default Sidebar;
