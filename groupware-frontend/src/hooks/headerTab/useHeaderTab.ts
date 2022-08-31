import { NextRouter } from 'next/router';
import { useMemo } from 'react';
import { EventType, RuleCategory, User, WikiType } from 'src/types';
import { EventTab, Tab, TabName } from 'src/types/header/tab/types';

type HeaderTab =
  | 'event'
  | 'account'
  | 'home'
  | 'wiki'
  | 'admin'
  | 'mention'
  | 'newUser'
  | 'chatDetail'
  | 'qaForm'
  | 'eventDetail'
  | 'adminEventDetail'
  | 'wikiDetail'
  | 'tagEdit'
  | 'wikiList';

type HeaderTabBehavior = {
  headerTabType: HeaderTab;
  queryRefresh?: (args: any) => void;
  personal?: string;
  from?: string;
  to?: string;
  user?: Partial<User>;
  router?: NextRouter;
  isSmallerThan768?: boolean;
  setActiveTab?: (value: React.SetStateAction<TabName>) => void;
  onDeleteClicked?: () => void;
  type?: WikiType;
};

const headerTab = (headerTabBehavior: HeaderTabBehavior): Tab[] => {
  const {
    headerTabType,
    queryRefresh,
    personal,
    from,
    to,
    user,
    router,
    isSmallerThan768,
    setActiveTab,
    onDeleteClicked,
  } = headerTabBehavior;

  const headerTabName = '内容を編集';

  switch (headerTabType) {
    case 'event':
      return [
        {
          name: EventTab.ALL,
          onClick: () => {
            if (queryRefresh)
              queryRefresh({
                page: '1',
                type: '',
                personal,
                from,
                to,
              });
          },
        },
        {
          name: EventTab.STUDY_MEETING,
          onClick: () => {
            if (queryRefresh)
              queryRefresh({
                page: '1',
                type: EventType.STUDY_MEETING,
                personal,
                from,
                to,
              });
          },
        },
        {
          name: EventTab.COACH,
          onClick: () => {
            if (queryRefresh)
              queryRefresh({
                page: '1',
                type: EventType.COACH,
                personal,
                from,
                to,
              });
          },
        },
        {
          name: EventTab.CLUB,
          onClick: () => {
            if (queryRefresh)
              queryRefresh({
                page: '1',
                type: EventType.CLUB,
                personal,
                from,
                to,
              });
          },
        },
        {
          name: EventTab.SUBMISSION_ETC,
          onClick: () => {
            if (queryRefresh)
              queryRefresh({
                page: '1',
                type: EventType.SUBMISSION_ETC,
                personal,
                from,
                to,
              });
          },
        },
      ];
    case 'account':
      return [
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
        {
          type: 'link',
          name: 'パスワード更新',
          href: '/account/update-password',
        },
      ];
    case 'home':
      return [
        {
          type: 'link',
          name: 'ダッシュボード',
          href: '/',
        },
        {
          type: 'link',
          name: 'メンション一覧',
          href: '/mention',
        },
      ];
    case 'wiki':
      return [
        {
          type: 'link',
          name: '社内Wiki Home',
          href: '/wiki',
        },
      ];
    case 'admin':
      return [
        {
          type: 'link',
          name: 'ユーザー管理',
          href: '/admin/users',
        },
        {
          type: 'link',
          name: 'ユーザー作成',
          href: '/admin/users/new',
        },
        {
          type: 'link',
          name: '勤怠報告管理',
          href: '/admin/attendance/verifyReport',
        },
        {
          type: 'link',
          name: 'タグ管理',
          href: '/admin/tag',
        },
        {
          type: 'link',
          name: 'タグ管理(ユーザー)',
          href: '/admin/tag/user',
        },
        {
          type: 'link',
          name: '特集管理',
          href: '/admin/top-news',
        },
        {
          type: 'link',
          name: 'CSV出力',
          href: '/admin/csv',
        },
      ];
    case 'tagEdit':
      return [
        {
          type: 'link',
          name: 'タグ管理',
          href: '/admin/tag',
        },
        {
          type: 'link',
          name: 'タグ管理(ユーザー)',
          href: '/admin/tag/user',
        },
      ];
    case 'mention':
      return [
        {
          type: 'link',
          name: 'ダッシュボード',
          href: '/',
        },
        {
          type: 'link',
          name: 'メンション一覧',
          href: '/mention',
        },
      ];
    case 'newUser':
      return [
        {
          type: 'link',
          name: '管理画面へ',
          href: '/admin/users',
        },
      ];
    case 'chatDetail':
      return isSmallerThan768
        ? [
            {
              name: 'ルーム一覧に戻る',
              onClick: () => {
                if (router) router.push('/chat', undefined, { shallow: true });
              },
            },
          ]
        : [];
    case 'qaForm':
      return [
        {
          onClick: () => {
            if (setActiveTab) setActiveTab(TabName.EDIT);
          },
          name: headerTabName,
        },
        {
          onClick: () => {
            if (setActiveTab) setActiveTab(TabName.PREVIEW);
          },
          name: 'プレビュー',
        },
      ];
    case 'eventDetail':
      return [
        {
          type: 'link',
          name: '一覧に戻る',
          href: '/event/list',
        },
      ];
    case 'adminEventDetail':
      return [
        {
          type: 'link',
          name: '一覧に戻る',
          href: '/event/list',
        },
        {
          name: 'イベントを削除',
          onClick: () => {
            if (onDeleteClicked) onDeleteClicked();
          },
          color: 'red',
        },
      ];
    case 'wikiDetail':
      return [
        {
          type: 'link',
          name: 'Wiki一覧画面へ',
          href: '/wiki/list?page=1&tag=&word=&status=new&type=',
        },
      ];
    case 'wikiList':
      return [
        {
          name: 'All',
          onClick: () => {
            {
              if (queryRefresh)
                queryRefresh({
                  type: undefined,
                  rule_category: undefined,
                  board_category: undefined,
                });
            }
          },
        },
        {
          name: '社内規則',
          onClick: () => {
            {
              if (queryRefresh)
                queryRefresh({
                  type: WikiType.RULES,
                  rule_category: RuleCategory.PHILOSOPHY,
                  board_category: undefined,
                });
            }
          },
        },
        {
          name: 'オール便',
          onClick: () => {
            {
              if (queryRefresh)
                queryRefresh({
                  page: '1',
                  type: WikiType.ALL_POSTAL,
                  rule_category: undefined,
                  board_category: undefined,
                });
            }
          },
        },
        {
          name: '掲示板',
          onClick: () => {
            {
              if (queryRefresh)
                queryRefresh({
                  page: '1',
                  type: WikiType.BOARD,
                  rule_category: undefined,
                });
            }
          },
        },
      ];
  }
};

export const useHeaderTab = (headerTabBehavior: HeaderTabBehavior) => {
  return useMemo<Tab[]>(() => {
    return headerTab(headerTabBehavior);
  }, [headerTabBehavior]);
};
