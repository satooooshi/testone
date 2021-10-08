import { ScreenName } from '@/components/Sidebar';
import accountInfoStyles from '@/styles/layouts/AccountInfo.module.scss';
import { useRouter } from 'next/router';
import LayoutWithTab from '@/components/LayoutWithTab';
import { useAPIGetUserInfoById } from '@/hooks/api/user/useAPIGetUserInfoById';
import Image from 'next/image';
import noImage from '@/public/no-image.jpg';
import { useState } from 'react';
import EventCard from '@/components/EventCard';
import QACard from '@/components/QACard';
import { axiosInstance } from 'src/utils/url';
import { jsonHeader } from 'src/utils/url/header';
import { useAPILogout } from '@/hooks/api/auth/useAPILogout';
import { useAuthenticate } from 'src/contexts/useAuthenticate';
import { Tab, TabName } from 'src/types/header/tab/types';
import Head from 'next/head';
import TopTabBar, { TopTabBehavior } from '@/components/TopTabBar';
import { useAPIGetEventList } from '@/hooks/api/event/useAPIGetEventList';
import { useAPIGetWikiList } from '@/hooks/api/wiki/useAPIGetWikiList';
import topTabBarStyles from '@/styles/components/TopTabBar.module.scss';

const MyAccountInfo = () => {
  const router = useRouter();
  const { id } = router.query as { id: string };
  const { data: profile } = useAPIGetUserInfoById(id);
  const { data: events } = useAPIGetEventList({ participant_id: id });
  const { data: questions } = useAPIGetWikiList({ writer: id });
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
  const tabs: Tab[] = [
    {
      type: 'link',
      name: 'アカウント情報',
      href: `/account/${user?.id}`,
    },
    {
      type: 'link',
      name: 'プロフィール編集',
      href: '/account/profile',
    },
  ];

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
        activeScreenName: ScreenName.ACCOUNT,
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
                <div className={accountInfoStyles.introduce_wrapper}>
                  <p className={accountInfoStyles.introduce_title_text}>
                    自己紹介
                  </p>
                  <p className={accountInfoStyles.introduce}>
                    {profile.introduce || '自己紹介が未記入です'}
                  </p>
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
            questions &&
            questions.qaQuestions.length ? (
              <div className={accountInfoStyles.question_wrapper}>
                {questions.qaQuestions.map((q) => (
                  <div
                    key={q.id}
                    className={accountInfoStyles.question_card_wrapper}>
                    <QACard qaQuestion={q} />
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
