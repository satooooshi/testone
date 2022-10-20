import LayoutWithTab from '@/components/layout/LayoutWithTab';
import dynamic from 'next/dynamic';
const ReactPaginate = dynamic(() => import('react-paginate'), { ssr: false });
import SearchForm from '@/components/common/SearchForm';
import UserCard from '@/components/user/UserCard';
import userListStyles from '@/styles/layouts/UserList.module.scss';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { BranchType, Tag, UserRole } from 'src/types';
import { toggleTag } from 'src/utils/toggleTag';
import paginationStyles from '@/styles/components/Pagination.module.scss';
import { userQueryRefresh } from 'src/utils/userQueryRefresh';
import { SidebarScreenName } from '@/components/layout/Sidebar';
import { Box, FormControl, FormLabel, Select, Text } from '@chakra-ui/react';
import TopTabBar, { TopTabBehavior } from '@/components/layout/TopTabBar';
import { useAPIGetUserTag } from '@/hooks/api/tag/useAPIGetUserTag';
import {
  SearchQueryToGetUsers,
  useAPISearchUsers,
} from '@/hooks/api/user/useAPISearchUsers';
import topTabBarStyles from '@/styles/components/TopTabBar.module.scss';

const UserList = () => {
  const router = useRouter();
  const query = router.query as SearchQueryToGetUsers;
  const { data: tags } = useAPIGetUserTag();
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const { data: users, isLoading } = useAPISearchUsers(query);

  const onToggleTag = (t: Tag) => {
    setSelectedTags((s) => toggleTag(s, t));
  };

  const queryRefresh = (newQuery?: Partial<SearchQueryToGetUsers>) => {
    const selectedTagIDs = selectedTags.map((t) => t.id.toString());
    const tagQuery = selectedTagIDs.join('+');
    const normalQuery: Partial<SearchQueryToGetUsers> = {
      page: query.page || '1',
      tag: tagQuery,
      word: query.word || '',
      sort: query.sort,
      branch: query.branch,
      role: query.role,
      duration: query.duration,
    };
    const url = userQueryRefresh({ ...normalQuery, ...newQuery });
    router.push(url, undefined, { shallow: true });
  };

  const topTabBehaviorList: TopTabBehavior[] = [
    {
      tabName: '全て',
      onClick: () => {
        queryRefresh({ sort: query.sort, role: undefined, page: '1' });
      },
      isActiveTab: !query.role,
    },
    {
      tabName: '管理者',
      onClick: () => {
        queryRefresh({ page: '1', role: UserRole.ADMIN });
      },
      isActiveTab: query.role === UserRole.ADMIN,
    },
    {
      tabName: '一般社員',
      onClick: () => {
        queryRefresh({ page: '1', role: UserRole.COMMON });
      },
      isActiveTab: query.role === UserRole.COMMON,
    },
    {
      tabName: 'コーチ',
      onClick: () => {
        queryRefresh({ page: '1', role: UserRole.COACH });
      },
      isActiveTab: query.role === UserRole.COACH,
    },
    {
      tabName: '講師(社員)',
      onClick: () => {
        queryRefresh({ page: '1', role: UserRole.INTERNAL_INSTRUCTOR });
      },
      isActiveTab: query.role === UserRole.INTERNAL_INSTRUCTOR,
    },
    {
      tabName: '講師(外部)',
      onClick: () => {
        queryRefresh({ page: '1', role: UserRole.EXTERNAL_INSTRUCTOR });
      },
      isActiveTab: query.role === UserRole.EXTERNAL_INSTRUCTOR,
    },
  ];

  useEffect(() => {
    if (tags) {
      const tagParam = query.tag || '';
      const tagsInQueryParams = tagParam.split(' ');
      const searchedTags =
        tags.filter((t) => tagsInQueryParams.includes(t.id.toString())) || [];
      setSelectedTags(searchedTags);
    }
  }, [query.tag, tags]);

  return (
    <LayoutWithTab
      sidebar={{ activeScreenName: SidebarScreenName.USERS }}
      header={{
        title: '社員名鑑',
      }}>
      <Head>
        <title>ボールド | 社員名鑑</title>
      </Head>
      <div className={userListStyles.above_pagination}>
        <Box mb="24px">
          <TopTabBar topTabBehaviorList={topTabBehaviorList} />
        </Box>
        <div className={userListStyles.search_form_wrapper}>
          <SearchForm
            onClear={() => setSelectedTags([])}
            onClickButton={(w) => queryRefresh({ page: '1', word: w })}
            tags={tags || []}
            selectedTags={selectedTags}
            toggleTag={onToggleTag}
          />
        </div>
        {!isLoading && !users?.users.length && (
          <Text alignItems="center" textAlign="center" mb={4}>
            検索結果が見つかりませんでした
          </Text>
        )}

        {users && users.users.length ? (
          <>
            <div className={userListStyles.sort_select_row}>
              <div className={userListStyles.sort_select_wrapper}>
                <FormControl>
                  <FormLabel pr={'2'}>ソート</FormLabel>
                  <Select
                    pr={'2'}
                    bg="white"
                    defaultValue={query.sort}
                    value={query.sort}
                    onChange={(e) => {
                      queryRefresh({
                        sort:
                          (e.target.value as 'event' | 'question' | 'answer') ||
                          undefined,
                        page: '1',
                      });
                      return;
                    }}>
                    <option value="">指定なし</option>
                    <option value="event">イベント参加数順</option>
                    <option value="question">質問数順</option>
                    <option value="answer">回答数順</option>
                    <option value="knowledge">ナレッジ投稿数順</option>
                  </Select>
                </FormControl>
              </div>
              <div className={userListStyles.sort_select_wrapper}>
                <FormControl>
                  <FormLabel px={'2'}>所属支社</FormLabel>
                  <Select
                    px={'2'}
                    bg="white"
                    defaultValue={query.branch}
                    value={query.branch}
                    onChange={(e) => {
                      queryRefresh({
                        branch: (e.target.value as BranchType) || undefined,
                        page: '1',
                      });
                      return;
                    }}>
                    <option value="">指定なし</option>
                    <option value="tokyo">東京支社</option>
                    <option value="osaka">大阪支社</option>
                  </Select>
                </FormControl>
              </div>
              <div className={userListStyles.sort_select_wrapper}>
                <FormControl>
                  <FormLabel pl={'2'}>期間</FormLabel>
                  <Select
                    pl={'2'}
                    bg="white"
                    defaultValue={query.duration}
                    value={query.duration}
                    onChange={(e) => {
                      queryRefresh({
                        duration:
                          (e.target.value as 'week' | 'month') || undefined,
                        page: '1',
                      });
                      return;
                    }}>
                    <option value="">指定なし</option>
                    <option value="week">週間</option>
                    <option value="month">月間</option>
                  </Select>
                </FormControl>
              </div>
            </div>

            <div className={userListStyles.user_card_row}>
              {users.users.map((u) => (
                <div key={u.id} className={userListStyles.user_card_wrapper}>
                  <UserCard
                    user={u}
                    onClickTag={(tag) => {
                      const defaultQuery = userQueryRefresh({
                        ...query,
                        tag: tag.id.toString(),
                      });
                      return defaultQuery;
                    }}
                    duration={query.duration}
                  />
                </div>
              ))}
            </div>
          </>
        ) : null}
      </div>
      {users?.pageCount ? (
        <div className={paginationStyles.pagination_wrap_layout}>
          <ReactPaginate
            pageCount={users.pageCount}
            onPageChange={({ selected }) => {
              queryRefresh({ page: (selected + 1).toString() });
            }}
            initialPage={query.page ? Number(query.page) - 1 : 0}
            forcePage={query.page ? Number(query.page) - 1 : 0}
            disableInitialCallback={true}
            previousLabel={'前へ'}
            nextLabel={'次へ'}
            marginPagesDisplayed={2}
            pageRangeDisplayed={5}
            containerClassName={paginationStyles.pagination}
            activeClassName={paginationStyles.active}
            disabledClassName={paginationStyles.button__disabled}
          />
        </div>
      ) : null}
    </LayoutWithTab>
  );
};
export default UserList;
