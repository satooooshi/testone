import { SidebarScreenName } from '@/components/layout/Sidebar';
import accountInfoStyles from '@/styles/layouts/AccountInfo.module.scss';
import { useRouter } from 'next/router';
import LayoutWithTab from '@/components/layout/LayoutWithTab';
import { useAPIGetUserInfoById } from '@/hooks/api/user/useAPIGetUserInfoById';
import Image from 'next/image';
import noImage from '@/public/no-image.jpg';
import React, { useEffect, useMemo, useState } from 'react';
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
import { useAPIGetUserGoodList } from '@/hooks/api/wiki/useAPIGetWikiGoodList';
import { useHeaderTab } from '@/hooks/headerTab/useHeaderTab';
import {
  Text,
  Box,
  Button,
  ThemeTypings,
  useMediaQuery,
  SimpleGrid,
  Flex,
  Wrap,
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
import { useAPISaveChatGroup } from '@/hooks/api/chat/useAPISaveChatGroup';
import { HiOutlineChat } from 'react-icons/hi';
import { AiOutlineArrowLeft } from 'react-icons/ai';
import { tagBgColorFactory } from 'src/utils/factory/tagBgColorFactory';
import { tagFontColorFactory } from 'src/utils/factory/tagFontColorFactory';

type UserTagListProps = {
  tags?: UserTag[];
  type: TagType;
};

const UserTagList: React.FC<UserTagListProps> = ({ tags, type }) => {
  const filteredTags = tags?.filter((t) => t.type === type);

  return (
    <Wrap spacing="8px" bg="white" rounded="md">
      {filteredTags && filteredTags.length ? (
        filteredTags.map((t) => (
          <Box key={t.id}>
            <Button
              bg={tagBgColorFactory(type)}
              color={tagFontColorFactory(type)}
              rounded="3px"
              size="xs">
              <Text fontWeight="normal" fontSize="14px">
                {t.name}
              </Text>
            </Button>
          </Box>
        ))
      ) : (
        <Button
          bg={tagBgColorFactory(type)}
          color={tagFontColorFactory(type)}
          rounded="3px"
          size="xs">
          <Text fontWeight="normal" fontSize="14px">
            未設定
          </Text>
        </Button>
      )}
    </Wrap>
  );
};

const MyAccountInfo = () => {
  const router = useRouter();
  const { id } = router.query as { id: string };
  const { data: profile } = useAPIGetUserInfoById(id);
  const { data: events, refetch: refetchEvent } = useAPIGetEventList(
    { participant_id: id },
    { enabled: false },
  );
  const { data: questionList, refetch: refetchQuestionList } =
    useAPIGetWikiList(
      {
        writer: id,
        type: WikiType.BOARD,
        board_category: BoardCategory.QA,
      },
      { enabled: false },
    );

  const { data: knowledgeList, refetch: refetchKnowledgeList } =
    useAPIGetWikiList(
      {
        writer: id,
        type: WikiType.BOARD,
        board_category: BoardCategory.KNOWLEDGE,
      },
      { enabled: false },
    );
  const { data: goodList, refetch: refetchGoodList } =
    useAPIGetUserGoodList(id);

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

  useEffect(() => {
    const refetchActiveTabData = (activeTab: TabName) => {
      switch (activeTab) {
        case TabName.EVENT:
          refetchEvent();
          return;
        case TabName.QUESTION:
          refetchQuestionList();
          return;
        case TabName.KNOWLEDGE:
          refetchKnowledgeList();
          return;
        case TabName.GOOD:
          refetchGoodList();
          return;
      }
    };
    if (activeTab) {
      refetchActiveTabData(activeTab);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  return (
    <LayoutWithTab
      sidebar={{
        activeScreenName:
          profile?.id !== user?.id ? SidebarScreenName.USERS : undefined,
      }}
      header={{
        title: 'Account',
        activeTabName: profile?.id === user?.id ? 'アカウント情報' : '',
        // tabs: profile?.id !== user?.id ? tabs : [],
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
              <Box mx="20px" className={accountInfoStyles.avatar}>
                {profile.avatarUrl ? (
                  <img src={profile.avatarUrl} alt="アバター画像" />
                ) : (
                  <Image src={noImage} alt="アバター画像" />
                )}
              </Box>
              <Box>
                <Text fontSize="20px" fontWeight="bold" mb="5px">
                  {`${profile.lastName} ${profile.firstName}`}
                  <Button
                    ml="10px"
                    size="xs"
                    bg="green.50"
                    color="green.600"
                    fontSize="14px"
                    fontWeight="none">
                    {userRoleNameFactory(profile.role)}
                  </Button>
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
                <Text fontSize="22px" fontWeight="bold" mb="12px" mr="auto">
                  タグ
                </Text>
                <SimpleGrid
                  bg="white"
                  w="100%"
                  p="20px"
                  mb="20px"
                  rounded="5px"
                  spacingY="16px">
                  <Text fontWeight="bold">技術タグ</Text>
                  <UserTagList tags={profile.tags} type={TagType.TECH} />
                  <Text mb="8px">{profile.introduceTech || '未入力'}</Text>
                  <Text fontWeight="bold">資格タグ</Text>
                  <UserTagList
                    tags={profile.tags}
                    type={TagType.QUALIFICATION}
                  />
                  <Text mb="8px">
                    {profile.introduceQualification || '未入力'}
                  </Text>
                  <Text fontWeight="bold">部活動タグ</Text>
                  <UserTagList tags={profile.tags} type={TagType.CLUB} />
                  <Text mb="8px">{profile.introduceClub || '未入力'}</Text>
                  <Text fontWeight="bold">趣味タグ</Text>
                  <UserTagList tags={profile.tags} type={TagType.HOBBY} />
                  <Text mb="8px">{profile.introduceHobby || '未入力'}</Text>
                </SimpleGrid>
                <Box w="100%">
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
            {activeTab === TabName.GOOD ? (
              goodList && goodList.length ? (
                <Box>
                  {goodList.map((b) => (
                    <WikiCard wiki={b.wiki} key={b.id} />
                  ))}
                </Box>
              ) : (
                <Text fontSize={16}>
                  いいねした掲示板が見つかりませんでした
                </Text>
              )
            ) : null}
          </Box>
        )}
      </div>
    </LayoutWithTab>
  );
};

export default MyAccountInfo;
