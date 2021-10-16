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
import topTabBarStyles from '@/styles/components/TopTabBar.module.scss';
import { Button, ThemeTypings } from '@chakra-ui/react';
import { TagType, UserTag } from 'src/types';
import { userRoleNameFactory } from 'src/utils/factory/userRoleNameFactory';

type UserTagListProps = {
  tags?: UserTag[];
  type: TagType;
};

const UserTagList: React.FC<UserTagListProps> = ({ tags, type }) => {
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
    <div className={accountInfoStyles.tag_list_wrapper}>
      <p className={accountInfoStyles.tag_label_text}>{labelName}</p>
      <div className={accountInfoStyles.tags_wrapper}>
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
      </div>
    </div>
  );
};

const MyAccountInfo = () => {
  const router = useRouter();
  const { id } = router.query as { id: string };
  const { data: profile } = useAPIGetUserInfoById(id);
  const { data: events } = useAPIGetEventList({ participant_id: id });
  console.log(events);

  const { data: wikiList } = useAPIGetWikiList({ writer: id });
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
      tabName: '参加したイベント',
      onClick: () => {
        setActiveTab(TabName.EVENT);
      },
      isActiveTab: activeTab === TabName.EVENT,
    },
    {
      tabName: '質問',
      onClick: () => {
        setActiveTab(TabName.QUESTION);
      },
      isActiveTab: activeTab === TabName.QUESTION,
    },
  ];

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
          <div className={accountInfoStyles.profile_wrapper}>
            <div className={accountInfoStyles.avatar_wrapper}>
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
            </div>

            <div className={accountInfoStyles.name_wrapper}>
              <h1 className={accountInfoStyles.name}>
                {profile.lastName + ' ' + profile.firstName}
              </h1>
            </div>

            <div className={topTabBarStyles.component_wrapper}>
              <TopTabBar topTabBehaviorList={topTabBehaviorList} />
            </div>

            {activeTab === TabName.DETAIL && (
              <div className={accountInfoStyles.info_wrapper}>
                <div className={accountInfoStyles.tag_list_area}>
                  <UserTagList tags={profile.tags} type={TagType.TECH} />
                  <UserTagList
                    tags={profile.tags}
                    type={TagType.QUALIFICATION}
                  />
                  <UserTagList tags={profile.tags} type={TagType.CLUB} />
                  <UserTagList tags={profile.tags} type={TagType.HOBBY} />
                </div>
                <div className={accountInfoStyles.info_texts_wrapper}>
                  <div className={accountInfoStyles.introduce_wrapper}>
                    <p className={accountInfoStyles.introduce_title_text}>
                      社員区分
                    </p>
                    <p className={accountInfoStyles.introduce}>
                      {userRoleNameFactory(profile.role)}
                    </p>
                  </div>
                  <div className={accountInfoStyles.introduce_wrapper}>
                    <p className={accountInfoStyles.introduce_title_text}>
                      自己紹介
                    </p>
                    <p className={accountInfoStyles.introduce}>
                      {profile.introduce || '自己紹介が未記入です'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === TabName.EVENT && events && events.events.length ? (
              <div className={accountInfoStyles.event_card_row}>
                {events.events.map((e) => (
                  <div
                    key={e.id}
                    className={accountInfoStyles.event_card_wrapper}>
                    <EventCard
                      hrefTagClick={(t) => `/event/list?tag=${t.id}`}
                      eventSchedule={e}
                    />
                  </div>
                ))}
              </div>
            ) : null}

            {activeTab === TabName.QUESTION &&
            wikiList &&
            wikiList.wiki.length ? (
              <div className={accountInfoStyles.question_wrapper}>
                {wikiList.wiki.map((w) => (
                  <div
                    key={w.id}
                    className={accountInfoStyles.question_card_wrapper}>
                    <WikiCard wiki={w} />
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        )}
      </div>
    </LayoutWithTab>
  );
};

export default MyAccountInfo;
