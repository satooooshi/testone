import { NextRouter } from 'next/router';
import { useMemo } from 'react';
import { EventType, RuleCategory, User, UserRole, WikiType } from 'src/types';
import { EventTab, Tab, TabName } from 'src/types/header/tab/types';

type HeaderTab =
  | 'event'
  | 'account'
  | 'home'
  | 'wiki'
  | 'userList'
  | 'admin'
  | 'mention'
  | 'newUser'
  | 'chatDetail'
  | 'qaForm'
  | 'eventDetail'
  // | 'adminEventDetail'
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
  onEditClicked?: () => void;
  onCreateClicked?: () => void;
  type?: WikiType;
  previousUrl?: string;
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
    onEditClicked,
    onCreateClicked,
    previousUrl,
  } = headerTabBehavior;

  const headerTabName = '内容を編集';

  switch (headerTabType) {
    case 'event':
      return [
        {
          name: 'カレンダー',
          onClick: () => {
            if (queryRefresh)
              queryRefresh({
                page: '1',
                personal,
                from: from || '',
                to: to || '',
              });
          },
        },
        {
          name: 'リスト',
          onClick: () => {
            if (queryRefresh)
              queryRefresh({
                page: '1',
                personal,
                from: undefined,
                to: undefined,
              });
          },
        },
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
          name: EventTab.ARTIST,
          onClick: () => {
            if (queryRefresh)
              queryRefresh({
                page: '1',
                type: EventType.ARTIST,
                personal,
                from,
                to,
              });
          },
        },
        {
          name: EventTab.IDOL,
          onClick: () => {
            if (queryRefresh)
              queryRefresh({
                page: '1',
                type: EventType.IDOL,
                personal,
                from,
                to,
              });
          },
        },
        {
          name: EventTab.YOUTUBER,
          onClick: () => {
            if (queryRefresh)
              queryRefresh({
                page: '1',
                type: EventType.YOUTUBER,
                personal,
                from,
                to,
              });
          },
        },
        {
          name: EventTab.TIKTOKER,
          onClick: () => {
            if (queryRefresh)
              queryRefresh({
                page: '1',
                type: EventType.TIKTOKER,
                personal,
                from,
                to,
              });
          },
        },
        {
          name: EventTab.INSTAGRAMER,
          onClick: () => {
            if (queryRefresh)
              queryRefresh({
                page: '1',
                type: EventType.INSTAGRAMER,
                personal,
                from,
                to,
              });
          },
        },
        {
          name: EventTab.TALENT,
          onClick: () => {
            if (queryRefresh)
              queryRefresh({
                page: '1',
                type: EventType.TALENT,
                personal,
                from,
                to,
              });
          },
        },
        {
          name: EventTab.OTHER,
          onClick: () => {
            if (queryRefresh)
              queryRefresh({
                page: '1',
                type: EventType.OTHER,
                personal,
                from,
                to,
              });
          },
        },
        {
          name: EventTab.OTHER,
          onClick: () => {
            if (queryRefresh)
              queryRefresh({
                page: '1',
                type: EventType.OTHER,
                personal,
                from,
                to,
              });
          },
        },
        {
          type: 'create',
          name: '作成',
          onClick: onCreateClicked,
        },
      ];
    case 'account':
      return [
        {
          type: 'backButton',
          name: '戻る',
          href:
            previousUrl?.indexOf('/users/list') !== -1
              ? previousUrl
              : '/users/list',
        },
      ];
    case 'home':
      return [
        {
          name: 'ダッシュボード',
          href: '/',
        },
        {
          name: 'メンション一覧',
          href: '/mention',
        },
      ];
    case 'wiki':
      return [
        {
          name: 'News Home',
          href: '/wiki',
        },
      ];
    case 'userList':
      return [
        {
          name: '全て',
          onClick: () => {
            if (queryRefresh) queryRefresh({ role: undefined, page: '1' });
          },
        },
        {
          name: '管理者',
          onClick: () => {
            if (queryRefresh) queryRefresh({ role: UserRole.ADMIN, page: '1' });
          },
        },
        {
          name: 'ファン',
          onClick: () => {
            if (queryRefresh)
              queryRefresh({ role: UserRole.COMMON, page: '1' });
          },
        },
        {
          name: 'インフルエンサー',
          onClick: () => {
            if (queryRefresh)
              queryRefresh({ role: UserRole.INFLUENCER, page: '1' });
          },
        },
      ];
    case 'admin':
      return [
        {
          name: 'ユーザー管理',
          href: '/admin/users',
        },
        // {
        //   name: '勤怠報告管理',
        //   href: '/admin/attendance/verifyReport',
        // },
        {
          name: 'タグ管理',
          href: '/admin/tag',
        },
        {
          name: 'タグ管理(ユーザー)',
          href: '/admin/tag/user',
        },
        {
          name: '特集管理',
          href: '/admin/top-news',
        },
        {
          name: 'CSV出力',
          href: '/admin/csv',
        },
      ];
    case 'tagEdit':
      return [
        {
          name: 'タグ管理',
          href: '/admin/tag',
        },
        {
          name: 'タグ管理(ユーザー)',
          href: '/admin/tag/user',
        },
      ];
    case 'mention':
      return [
        {
          name: 'ダッシュボード',
          href: '/',
        },
        {
          name: 'メンション一覧',
          href: '/mention',
        },
      ];
    case 'newUser':
      return [
        {
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
          type: 'backButton',
          name: '戻る',
          href:
            previousUrl?.indexOf('/event/list') !== -1
              ? previousUrl
              : '/event/list?page=1&tag=&word=&status=past&from=2022-06-30&to=2022-08-07&personal=',
        },
        {
          type: 'edit',
          name: '編集する',
          onClick: onEditClicked,
        },
        {
          type: 'delete',
          name: '削除する',
          onClick: onDeleteClicked,
        },
      ];
    // case 'adminEventDetail':
    //   return [
    //     {
    //       type: 'backButton',
    //       name: '戻る',
    //       href: '/event/list',
    //     },
    //     {
    //       type: 'delete',
    //       name: '削除する',
    //       onClick: () => {
    //         if (onDeleteClicked) onDeleteClicked();
    //       },
    //     },
    //   ];
    case 'wikiDetail':
      return [
        {
          type: 'backButton',
          name: '戻る',
          href:
            previousUrl?.indexOf('/wiki/list') !== -1
              ? previousUrl
              : '/wiki/list',
        },
        {
          type: 'edit',
          name: '編集する',
          onClick: onEditClicked,
        },
      ];
    case 'wikiList':
      return [
        {
          name: '全て',
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
        // {
        //   name: '社内規則',
        //   onClick: () => {
        //     {
        //       if (queryRefresh)
        //         queryRefresh({
        //           type: WikiType.RULES,
        //           rule_category: RuleCategory.PHILOSOPHY,
        //           board_category: undefined,
        //         });
        //     }
        //   },
        // },
        {
          name: '運営からのお知らせ',
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
          name: 'メルマガ',
          onClick: () => {
            {
              if (queryRefresh)
                queryRefresh({
                  page: '1',
                  type: WikiType.MAIL_MAGAZINE,
                  rule_category: undefined,
                  board_category: undefined,
                });
            }
          },
        },
        {
          name: '全社員インタビュー',
          onClick: () => {
            {
              if (queryRefresh)
                queryRefresh({
                  page: '1',
                  type: WikiType.INTERVIEW,
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
        {
          type: 'create',
          name: '作成',
          onClick: onCreateClicked,
        },
      ];
  }
};

export const useHeaderTab = (headerTabBehavior: HeaderTabBehavior) => {
  return useMemo<Tab[]>(() => {
    return headerTab(headerTabBehavior);
  }, [headerTabBehavior]);
};
