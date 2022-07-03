import React, { ReactNode } from 'react';
import { RiAccountCircleFill, RiLogoutBoxRLine } from 'react-icons/ri';
import { HiHome } from 'react-icons/hi';
import { BiCalendarEvent } from 'react-icons/bi';
import { BsChatDotsFill } from 'react-icons/bs';
import { FaUserCog, FaUsers } from 'react-icons/fa';
import sidebarStyles from '@/styles/components/Sidebar.module.scss';
import clsx from 'clsx';
import { useAuthenticate } from 'src/contexts/useAuthenticate';
import { UserRole } from 'src/types';
import Link from 'next/link';
import {
  AiFillTags,
  AiOutlineGlobal,
  AiOutlineLogout,
  AiOutlineRight,
} from 'react-icons/ai';
import {
  Box,
  Badge,
  Avatar,
  Text,
  Menu,
  MenuButton,
  MenuList,
  Button,
  MenuItem,
  MenuDivider,
} from '@chakra-ui/react';
// import { Menu, MenuItem, MenuButton, MenuDivider,  MenuList, } from '@szhsin/react-menu';
import { useHandleBadge } from 'src/contexts/badge/useHandleBadge';
import { AiOutlineDoubleLeft } from 'react-icons/ai';
import Image from 'next/image';
import boldLogo from '@/public/bold-logo.png';
import router from 'next/router';
import { darkFontColor } from 'src/utils/colors';
import { useAPILogout } from '@/hooks/api/auth/useAPILogout';
import { axiosInstance } from 'src/utils/url';
import { jsonHeader } from 'src/utils/url/header';
import { GrLogout } from 'react-icons/gr';
import { IoMdLogOut } from 'react-icons/';

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
  const { mutate: logout } = useAPILogout({
    onSuccess: () => {
      const removeLocalStorage = async () => {
        await Promise.resolve();
        localStorage.removeItem('userToken');
        axiosInstance.defaults.headers = jsonHeader;
      };
      removeLocalStorage();
      router.push('/login');
    },
  });

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
          {/* <LinkWithIcon
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
          /> */}
        </div>
        {/* {user?.role === UserRole.ADMIN ? (
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
        )} */}
        <Box>
          <Menu>
            {({ isOpen }) => (
              <>
                <MenuButton
                  // w="20px"
                  // isActive={isOpen}
                  bg="transparent"
                  as={Box}
                  // rightIcon={
                  //   <AiOutlineRight size={20} color={darkFontColor} />
                  // }
                  className={sidebarStyles.login_user_item}>
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
                    <Box ml="auto">
                      <AiOutlineRight size={20} color={darkFontColor} />
                    </Box>
                  </div>
                </MenuButton>
                <MenuList borderWidth="2px">
                  <MenuItem
                    icon={<RiAccountCircleFill size={20} />}
                    h={10}
                    onClick={() => {
                      router.push(`/account/${user?.id}`);
                    }}>
                    プロフィール
                  </MenuItem>
                  {user?.role === UserRole.ADMIN && (
                    <MenuItem
                      icon={<FaUserCog size={20} />}
                      h={10}
                      onClick={() => {
                        router.push('/admin/users');
                      }}>
                      管理者ページ
                    </MenuItem>
                  )}
                  <MenuDivider />
                  <MenuItem
                    icon={<RiLogoutBoxRLine size={20} />}
                    onClick={() => {
                      logout();
                    }}>
                    ログアウト
                  </MenuItem>
                </MenuList>
              </>
            )}
          </Menu>
        </Box>
      </div>
      {/* </div> */}
    </>
  );
};

export default Sidebar;
