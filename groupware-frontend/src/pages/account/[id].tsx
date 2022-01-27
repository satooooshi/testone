import { SidebarScreenName } from '@/components/layout/Sidebar';
import accountInfoStyles from '@/styles/layouts/AccountInfo.module.scss';
import { useRouter } from 'next/router';
import LayoutWithTab from '@/components/layout/LayoutWithTab';
import { useAPIGetUserInfoById } from '@/hooks/api/user/useAPIGetUserInfoById';
import Image from 'next/image';
import noImage from '@/public/no-image.jpg';
import React, { useMemo, useState } from 'react';
import EventCard from '@/components/common/EventCard';
import WikiCard from '@/components/common/WikiCard';
import { axiosInstance } from 'src/utils/url';
import { jsonHeader } from 'src/utils/url/header';
import { useAPILogout } from '@/hooks/api/auth/useAPILogout';
import { useAuthenticate } from 'src/contexts/useAuthenticate';
import { Tab, TabName } from 'src/types/header/tab/types';
import Head from 'next/head';
import TopTabBar, { TopTabBehavior } from '@/components/layout/TopTabBar';
import { useAPIGetEventList } from '@/hooks/api/event/useAPIGetEventList';
import { useAPIGetWikiList } from '@/hooks/api/wiki/useAPIGetWikiList';
import { useHeaderTab } from '@/hooks/headerTab/useHeaderTab';
import {
  Text,
  Box,
  Button,
  ThemeTypings,
  useMediaQuery,
  SimpleGrid,
} from '@chakra-ui/react';
import { BoardCategory, TagType, UserTag, WikiType } from 'src/types';
import { userRoleNameFactory } from 'src/utils/factory/userRoleNameFactory';
import { darkFontColor } from 'src/utils/colors';
import { userNameFactory } from 'src/utils/factory/userNameFactory';
import { useAPISaveChatGroup } from '@/hooks/api/chat/useAPISaveChatGroup';

type UserTagListProps = {
  tags?: UserTag[];
  type: TagType;
  introduce: string;
};

const UserTagList: React.FC<UserTagListProps> = ({ tags, type, introduce }) => {
  const color: ThemeTypings['colorSchemes'] = useMemo(() => {
    switch (type) {
      case TagType.TECH:
        return 'teal';
      case TagType.QUALIFICATION:
        return 'blue';
      case TagType.CLUB:
        return 'green';
      case TagType.HOBBY:
        return 'pink';
      default:
        return 'teal';
    }
  }, [type]);

  const labelName: string = useMemo(() => {
    switch (type) {
      case TagType.TECH:
        return '技術';
      case TagType.QUALIFICATION:
        return '資格';
      case TagType.CLUB:
        return '部活動';
      case TagType.HOBBY:
        return '趣味';
      default:
        return '';
    }
  }, [type]);

  return (
    <Box bg="white" rounded="md" p={2}>
      <Text fontWeight="bold" mb={2} fontSize={14}>{`${labelName}タグ`}</Text>
      <Box display="flex" flexFlow="row" flexWrap="wrap" mb={4}>
        {tags?.length ? (
          tags
            ?.filter((t) => t.type === type)
            .map((t) => (
              <div key={t.id} className={accountInfoStyles.tag_button_wrapper}>
                <Button colorScheme={color} size="xs">
                  {t.name}
                </Button>
              </div>
            ))
        ) : (
          <Button colorScheme={color} size="xs">
            未設定
          </Button>
        )}
      </Box>
      <Box>
        <Text mb={2} fontSize={14}>{`${labelName}の紹介`}</Text>
        <Text fontSize={16} color={darkFontColor} fontWeight="bold">
          {introduce || '未入力'}
        </Text>
      </Box>
    </Box>
  );
};

const MyAccountInfo = () => {
  const router = useRouter();
  const { id } = router.query as { id: string };
  const { data: profile } = useAPIGetUserInfoById(id);
  const { data: events } = useAPIGetEventList({ participant_id: id });
  const { data: questionList } = useAPIGetWikiList({
    writer: id,
    type: WikiType.BOARD,
    board_category: BoardCategory.QA,
  });
  const { data: knowledgeList } = useAPIGetWikiList({
    writer: id,
    type: WikiType.BOARD,
    board_category: BoardCategory.KNOWLEDGE,
  });
  const { user } = useAuthenticate();
  const [activeTab, setActiveTab] = useState<TabName>(TabName.DETAIL);
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
  const [isSmallerThan1024] = useMediaQuery('(max-width: 1024px)');
  const [isSmallerThan768] = useMediaQuery('(max-width: 768px)');

  const tabs: Tab[] = useHeaderTab({ headerTabType: 'account', user });

  const topTabBehaviorList: TopTabBehavior[] = [
    {
      tabName: '詳細',
      onClick: () => {
        setActiveTab(TabName.DETAIL);
      },
      isActiveTab: activeTab === TabName.DETAIL,
    },
    {
      tabName: '参加したイベント (直近20件)',
      onClick: () => {
        setActiveTab(TabName.EVENT);
      },
      isActiveTab: activeTab === TabName.EVENT,
    },
    {
      tabName: '質問 (直近20件)',
      onClick: () => {
        setActiveTab(TabName.QUESTION);
      },
      isActiveTab: activeTab === TabName.QUESTION,
    },
    {
      tabName: 'ナレッジ (直近20件)',
      onClick: () => {
        setActiveTab(TabName.KNOWLEDGE);
      },
      isActiveTab: activeTab === TabName.KNOWLEDGE,
    },
  ];

  const { mutate: createGroup } = useAPISaveChatGroup({
    onSuccess: (createdData) => {
      router.push(`/chat/${createdData.id.toString()}`, undefined, {
        shallow: true,
      });
    },
  });

  return (
    <LayoutWithTab
      sidebar={{
        activeScreenName: SidebarScreenName.ACCOUNT,
      }}
      header={{
        title: 'Account',
        activeTabName: profile?.id === user?.id ? 'アカウント情報' : '',
        tabs: profile?.id === user?.id ? tabs : [],
        rightButtonName: profile?.id === user?.id ? 'ログアウト' : undefined,
        onClickRightButton:
          profile?.id === user?.id ? () => logout() : undefined,
      }}>
      <Head>
        <title>
          ボールド | {profile ? `${profile.lastName} ${profile.firstName}` : ''}
        </title>
      </Head>
      <div className={accountInfoStyles.main}>
        {profile && (
          <Box
            display="flex"
            flexDir="column"
            alignSelf="center"
            alignItems="center"
            w={isSmallerThan768 ? '90vw' : undefined}>
            <Box mb="16px">
              {profile.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt="アバター画像"
                  className={accountInfoStyles.avatar}
                />
              ) : (
                <Image
                  src={noImage}
                  alt="アバター画像"
                  className={accountInfoStyles.avatar}
                />
              )}
            </Box>

            {/* <div className={accountInfoStyles.name_wrapper}> */}
            {/*   <h1 className={accountInfoStyles.name}> */}
            {/*     {userNameFactory(user)} */}
            {/*   </h1> */}
            {/* </div> */}
            <Box display="flex" flexDir="row" justifyContent="center" mb="16px">
              <Text
                fontSize={20}
                fontWeight="bold"
                color={darkFontColor}
                display="block">
                {userNameFactory(profile)}
              </Text>
            </Box>

            <Box mb="24px">
              <TopTabBar topTabBehaviorList={topTabBehaviorList} />
            </Box>

            {activeTab === TabName.DETAIL && (
              <>
                <Box w="80vw">
                  <Box
                    display="flex"
                    mb={5}
                    flexDir="row"
                    alignItems="center"
                    w="100%">
                    <Text fontSize={14} w={'10%'}>
                      社員番号:
                    </Text>
                    <Text
                      fontWeight="bold"
                      w="85%"
                      fontSize={18}
                      color={darkFontColor}>
                      {profile.employeeId || '未登録'}
                    </Text>
                  </Box>
                  <Box
                    display="flex"
                    mb={5}
                    flexDir="row"
                    alignItems="center"
                    w="100%">
                    <Text fontSize={14} w={'10%'}>
                      社員区分:
                    </Text>
                    <Text
                      fontWeight="bold"
                      w="85%"
                      fontSize={18}
                      color={darkFontColor}>
                      {userRoleNameFactory(profile.role)}
                    </Text>
                  </Box>
                  <Box
                    display="flex"
                    flexDir="row"
                    alignItems="center"
                    mb={8}
                    w="100%">
                    <Text fontSize={14} w={'10%'}>
                      自己紹介:
                    </Text>
                    <Text
                      fontWeight="bold"
                      w="85%"
                      fontSize={18}
                      color={darkFontColor}
                      className={accountInfoStyles.introduce}>
                      {profile.introduceOther || '未入力'}
                    </Text>
                  </Box>
                  <Box w={'100%'} display="flex" flexDir="row" flexWrap="wrap">
                    <Box mb={8} mr={4} w={isSmallerThan1024 ? '100%' : '49%'}>
                      <UserTagList
                        tags={profile.tags}
                        type={TagType.TECH}
                        introduce={profile.introduceTech}
                      />
                    </Box>
                    <Box mb={8} w={isSmallerThan1024 ? '100%' : '49%'}>
                      <UserTagList
                        tags={profile.tags}
                        type={TagType.QUALIFICATION}
                        introduce={profile.introduceQualification}
                      />
                    </Box>
                    <Box mb={8} mr={4} w={isSmallerThan1024 ? '100%' : '49%'}>
                      <UserTagList
                        tags={profile.tags}
                        type={TagType.CLUB}
                        introduce={profile.introduceClub}
                      />
                    </Box>
                    <Box mb={8} w={isSmallerThan1024 ? '100%' : '49%'}>
                      <UserTagList
                        tags={profile.tags}
                        type={TagType.HOBBY}
                        introduce={profile.introduceHobby}
                      />
                    </Box>

                    <Button
                      onClick={() =>
                        createGroup({ name: '', members: [profile] })
                      }
                      width={'100%'}
                      colorScheme="green">
                      チャットへ
                    </Button>
                  </Box>
                </Box>
              </>
            )}

            {activeTab === TabName.EVENT && events && events.events.length ? (
              <SimpleGrid columns={{ sm: 1, md: 1, lg: 2 }} spacing="16px">
                {events.events.map((e) => (
                  <EventCard
                    key={e.id}
                    hrefTagClick={(t) => `/event/list?tag=${t.id}`}
                    eventSchedule={e}
                  />
                ))}
              </SimpleGrid>
            ) : null}

            {activeTab === TabName.QUESTION &&
            questionList &&
            questionList.wiki.length ? (
              <Box>
                {questionList.wiki.map((w) => (
                  <WikiCard wiki={w} key={w.id} />
                ))}
              </Box>
            ) : null}

            {activeTab === TabName.KNOWLEDGE &&
            knowledgeList &&
            knowledgeList.wiki.length ? (
              <Box>
                {knowledgeList.wiki.map((w) => (
                  <WikiCard wiki={w} key={w.id} />
                ))}
              </Box>
            ) : null}
          </Box>
        )}
      </div>
    </LayoutWithTab>
  );
};

export default MyAccountInfo;
