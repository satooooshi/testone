import LayoutWithTab from '@/components/LayoutWithTab';
import ReactPaginate from 'react-paginate';
import SearchForm from '@/components/SearchForm';
import UserCard from '@/components/UserCard';
import userListStyles from '@/styles/layouts/UserList.module.scss';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { Tag, UserRole } from 'src/types';
import { toggleTag } from 'src/utils/toggleTag';
import paginationStyles from '@/styles/components/Pagination.module.scss';
import { userQueryRefresh } from 'src/utils/userQueryRefresh';
import { ScreenName } from '@/components/Sidebar';
import { FormControl, FormLabel, Select } from '@chakra-ui/react';
import TopTabBar, { TopTabBehavior } from '@/components/TopTabBar';
import { useAPIGetUserTag } from '@/hooks/api/tag/useAPIGetUserTag';
import {
  SearchQueryToGetUsers,
  useAPISearchUsers,
} from '@/hooks/api/user/useAPISearchUsers';

const UserList = () => {
  const router = useRouter();
  const query = router.query as SearchQueryToGetUsers;
  const { data: tags } = useAPIGetUserTag();
  const [searchWord, setSearchWord] = useState('');
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const { data: users } = useAPISearchUsers(query);

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
        queryRefresh({ sort: query.sort, role: undefined });
      },
      isActiveTab: !query.role,
    },
    {
      tabName: '管理者',
      onClick: () => {
        queryRefresh({ role: UserRole.ADMIN });
      },
      isActiveTab: query.role === UserRole.ADMIN,
    },
    {
      tabName: '一般社員',
      onClick: () => {
        queryRefresh({ role: UserRole.COMMON });
      },
      isActiveTab: query.role === UserRole.COMMON,
    },
    {
      tabName: '本社勤務',
      onClick: () => {
        queryRefresh({ role: UserRole.HEAD_OFFICE });
      },
      isActiveTab: query.role === UserRole.HEAD_OFFICE,
    },
    {
      tabName: '講師',
      onClick: () => {
        queryRefresh({ role: UserRole.INSTRUCTOR });
      },
      isActiveTab: query.role === UserRole.INSTRUCTOR,
    },
  ];

  return (
    <LayoutWithTab
      sidebar={{ activeScreenName: ScreenName.USERS }}
      header={{
        title: '社員名鑑',
      }}>
      <Head>
        <title>ボールド | 社員名鑑</title>
      </Head>
      <div className={userListStyles.above_pagination}>
        <div className={userListStyles.search_form_wrapper}>
          <SearchForm
            onCancelTagModal={() => setSelectedTags([])}
            value={searchWord || ''}
            onChange={(e) => setSearchWord(e.currentTarget.value)}
            onClickButton={() => queryRefresh({ word: searchWord })}
            tags={tags || []}
            selectedTags={selectedTags}
            toggleTag={onToggleTag}
          />
        </div>

        <TopTabBar topTabBehaviorList={topTabBehaviorList} />

        <div className={userListStyles.sort_select_row}>
          <div className={userListStyles.sort_select_wrapper}>
            <FormControl>
              <FormLabel>ソート</FormLabel>
              <Select
                bg="white"
                onChange={(e) => {
                  queryRefresh({
                    sort:
                      (e.target.value as 'event' | 'question' | 'answer') ||
                      undefined,
                  });
                  return;
                }}>
                <option value="">指定なし</option>
                <option value="event">イベント参加数順</option>
                <option value="question">質問数順</option>
                <option value="answer">回答数順</option>
              </Select>
            </FormControl>
          </div>
          <div className={userListStyles.sort_select_wrapper}>
            <FormControl>
              <FormLabel>期間</FormLabel>
              <Select
                bg="white"
                onChange={(e) => {
                  queryRefresh({
                    duration: (e.target.value as 'week' | 'month') || undefined,
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
          {users && users.users.length
            ? users.users.map((u) => (
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
              ))
            : null}
        </div>
      </div>
      {users && users.pageCount ? (
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
