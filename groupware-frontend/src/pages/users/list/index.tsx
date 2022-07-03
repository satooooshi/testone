import LayoutWithTab from '@/components/layout/LayoutWithTab';
import dynamic from 'next/dynamic';
const ReactPaginate = dynamic(() => import('react-paginate'), { ssr: false });
import SearchForm from '@/components/common/SearchForm';
import UserCard from '@/components/user/UserCard';
import userListStyles from '@/styles/layouts/UserList.module.scss';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { Tag, UserRole } from 'src/types';
import { toggleTag } from 'src/utils/toggleTag';
import paginationStyles from '@/styles/components/Pagination.module.scss';
import { userQueryRefresh } from 'src/utils/userQueryRefresh';
import { SidebarScreenName } from '@/components/layout/Sidebar';
import {
  Box,
  FormControl,
  FormLabel,
  Select,
  SimpleGrid,
  Text,
} from '@chakra-ui/react';
import TopTabBar, { TopTabBehavior } from '@/components/layout/TopTabBar';
import { useAPIGetUserTag } from '@/hooks/api/tag/useAPIGetUserTag';
import {
  SearchQueryToGetUsers,
  useAPISearchUsers,
} from '@/hooks/api/user/useAPISearchUsers';
import topTabBarStyles from '@/styles/components/TopTabBar.module.scss';
import {
  getUserSortName,
  getUserSortValue,
} from 'src/utils/userList/sortNameFormatter';
import { useHeaderTab } from '@/hooks/headerTab/useHeaderTab';
import { Tab } from 'src/types/header/tab/types';

const UserList = () => {
  const router = useRouter();
  const query = router.query as SearchQueryToGetUsers;
  const { data: tags } = useAPIGetUserTag();
  const [searchWord, setSearchWord] = useState(query.word);
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
      role: query.role,
      duration: query.duration,
    };
    const url = userQueryRefresh({ ...normalQuery, ...newQuery });
    router.push(url, undefined, { shallow: true });
  };

  const tabs: Tab[] = useHeaderTab({
    headerTabType: 'userList',
    queryRefresh,
  });

  console.log('ppp', tags);

  const initialHeaderValue = {
    title: '社員名鑑',
    activeTabName:
      query.role === UserRole.ADMIN
        ? '管理者'
        : query.role === UserRole.COMMON
        ? '一般社員'
        : query.role === UserRole.COACH
        ? 'コーチ'
        : query.role === UserRole.INTERNAL_INSTRUCTOR
        ? '講師(社員)'
        : query.role === UserRole.EXTERNAL_INSTRUCTOR
        ? '講師(外部)'
        : '全て',
    tabs: tabs,
  };

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
      header={initialHeaderValue}>
      <Head>
        <title>ボールド | 社員名鑑</title>
      </Head>
      {/* <TopTabBar topTabBehaviorList={topTabBehaviorList} /> */}
      <SearchForm
        onClear={() => setSelectedTags([])}
        value={searchWord || ''}
        onChange={(e) => setSearchWord(e.currentTarget.value)}
        onClickButton={() => queryRefresh({ page: '1', word: searchWord })}
        tags={tags || []}
        selectedTags={selectedTags}
        toggleTag={onToggleTag}
      />
      {!isLoading && !users?.users.length && (
        <Text alignItems="center" textAlign="center" mb={4}>
          検索結果が見つかりませんでした
        </Text>
      )}

      {users && users.users.length ? (
        <>
          <Box w="100%" mb="20px" display="flex" justifyContent="flex-start">
            <FormControl w="200px">
              <Select
                bg="white"
                defaultValue={query.sort}
                value={query.sort}
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
                <option value="knowledge">ナレッジ投稿数順</option>
              </Select>
            </FormControl>
            <FormControl w="200px" ml="20px">
              <Select
                bg="white"
                defaultValue={query.duration}
                value={query.duration}
                onChange={(e) => {
                  queryRefresh({
                    duration: (e.target.value as 'week' | 'month') || undefined,
                  });
                  return;
                }}>
                <option value="">全期間</option>
                <option value="week">週間</option>
                <option value="month">月間</option>
              </Select>
            </FormControl>
          </Box>
          <SimpleGrid minChildWidth="520px" spacing="20px" w="100%" mx="auto">
            {users.users.map((u) => (
              <div key={u.id}>
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
          </SimpleGrid>
        </>
      ) : null}
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
