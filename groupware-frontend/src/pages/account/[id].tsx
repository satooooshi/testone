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
  Flex,
} from '@chakra-ui/react';
import {
  BoardCategory,
  RoomType,
  TagType,
  UserRole,
  UserTag,
  WikiType,
} from 'src/types';
import { userRoleNameFactory } from 'src/utils/factory/userRoleNameFactory';
import { branchTypeNameFactory } from 'src/utils/factory/branchTypeNameFactory';
import { blueColor, darkFontColor } from 'src/utils/colors';
import { userNameFactory } from 'src/utils/factory/userNameFactory';
import { useAPISaveChatGroup } from '@/hooks/api/chat/useAPISaveChatGroup';
import { HiOutlineChat } from 'react-icons/hi';
import { AiOutlineArrowLeft } from 'react-icons/ai';

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
        <Text
          fontSize={16}
          fontWeight="bold"
          className={accountInfoStyles.introduce}>
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
  const previousUrl = document.referrer;

  const tabs: Tab[] = useHeaderTab({
    headerTabType: 'account',
    user,
    previousUrl,
  });

  const topTabBehaviorList: TopTabBehavior[] = [
    {
      tabName: 'プロフィール',
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
    {
      tabName: 'いいね (直近20件)',
      onClick: () => {
        setActiveTab(TabName.GOOD);
      },
      isActiveTab: activeTab === TabName.GOOD,
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
        activeScreenName:
          profile?.id !== user?.id ? SidebarScreenName.USERS : undefined,
      }}
      header={{
        title: 'Account',
        activeTabName: profile?.id === user?.id ? 'アカウント情報' : '',
        tabs: profile?.id !== user?.id ? tabs : [],
        rightButtonName: profile?.id === user?.id ? 'ログアウト' : undefined,
        onClickRightButton:
          profile?.id === user?.id ? () => logout() : undefined,
      }}>
      <Head>
        <title>
          ボールド | {profile ? `${profile.lastName} ${profile.firstName}` : ''}
        </title>
      </Head>
      <Box w="100%" mt="20px" mb="40px">
        <Button bg="white" w="120px" onClick={() => router.back()}>
          <Box mr="10px">
            <AiOutlineArrowLeft size="20px" />
          </Box>
          <Text fontSize="14px">戻る</Text>
        </Button>
      </Box>
      <div className={accountInfoStyles.main}>
        {profile && (
          <Box
            display="flex"
            flexDir="column"
            alignSelf="center"
            alignItems="center"
            w="100%">
            <Flex direction="row" bg="white" w="100%" p="30px" rounded="5px">
              <Box mx="20px">
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
              <Box>
                <Text fontSize="20px" fontWeight="bold" mb="5px">
                  {`${profile.lastName} ${profile.firstName}`}
                </Text>
                <Text fontSize="12px" color="gray" mb="12px">
                  {`${profile.lastNameKana} ${profile.firstNameKana}`}
                </Text>
                <Text fontWeight="bold" mb="12px">
                  自己紹介
                </Text>
                <Text>{profile.introduceOther || '未入力'}</Text>
              </Box>
            </Flex>

            <Box w="100%" my="30px">
              <TopTabBar topTabBehaviorList={topTabBehaviorList} />
            </Box>

            {activeTab === TabName.DETAIL && (
              <>
                <Text fontSize="22px" fontWeight="bold" mb="12px" mr="auto">
                  プロフィール
                </Text>
                <SimpleGrid
                  bg="white"
                  w="100%"
                  p="20px"
                  mb="20px"
                  rounded="5px"
                  spacingY="16px">
                  <Text fontWeight="bold">メールアドレス</Text>
                  <Text>
                    {profile.isEmailPublic ? profile.email : '非公開'}
                  </Text>
                  <Text fontWeight="bold">携帯電話番号</Text>
                  <Text>
                    {profile.isPhonePublic ? profile.phone : '非公開'}
                  </Text>
                  <Text fontWeight="bold">所属支社</Text>
                  <Text>{branchTypeNameFactory(profile.branch)}</Text>
                  <Text fontWeight="bold">社員コード</Text>
                  <Text>{profile.employeeId || '未登録'}</Text>
                </SimpleGrid>
                <Box w="100%">
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
                    w={'100%'}
                    mb={35}
                    display="flex"
                    flexDir="row"
                    flexWrap="wrap">
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
                  </Box>
                  {profile?.id !== user?.id &&
                    profile.role !== UserRole.EXTERNAL_INSTRUCTOR && (
                      <Button
                        h={'64px'}
                        w={'64px'}
                        bg={blueColor}
                        position={'fixed'}
                        top={'auto'}
                        bottom={'24px'}
                        right={'24px'}
                        rounded={'full'}
                        zIndex={1}
                        px={0}
                        _hover={{ textDecoration: 'none' }}>
                        <HiOutlineChat
                          style={{ width: 40, height: 40 }}
                          onClick={() =>
                            createGroup({
                              name: '',
                              members: [profile],
                              roomType: RoomType.PERSONAL,
                            })
                          }
                          color="white"
                        />
                      </Button>
                    )}
                </Box>
              </>
            )}

            {activeTab === TabName.EVENT ? (
              events && events.events.length ? (
                <SimpleGrid
                  w="100%"
                  minChildWidth="360px"
                  maxChildWidth="420px"
                  spacing="20px">
                  {events.events.map((e) => (
                    <EventCard
                      key={e.id}
                      hrefTagClick={(t) => `/event/list?tag=${t.id}`}
                      eventSchedule={e}
                    />
                  ))}
                </SimpleGrid>
              ) : (
                <Text fontSize={16}>
                  参加したイベントが見つかりませんでした
                </Text>
              )
            ) : null}

            {activeTab === TabName.QUESTION ? (
              questionList && questionList.wiki.length ? (
                <Box w="100%">
                  {questionList.wiki.map((w) => (
                    <WikiCard wiki={w} key={w.id} />
                  ))}
                </Box>
              ) : (
                <Text fontSize={16}>投稿した質問が見つかりませんでした</Text>
              )
            ) : null}

            {activeTab === TabName.KNOWLEDGE ? (
              knowledgeList && knowledgeList.wiki.length ? (
                <Box w="100%">
                  {knowledgeList.wiki.map((w) => (
                    <WikiCard wiki={w} key={w.id} />
                  ))}
                </Box>
              ) : (
                <Text fontSize={16}>
                  投稿したナレッジが見つかりませんでした
                </Text>
              )
            ) : null}
            {activeTab === TabName.GOOD &&
            profile.userGoodForBoard &&
            profile.userGoodForBoard.length ? (
              <Box w="100%">
                {profile.userGoodForBoard.map((w) => (
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
