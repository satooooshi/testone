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

  const tabs: Tab[] = useHeaderTab({
    headerTabType: 'userList',
    queryRefresh,
  });

  console.log('ppp', tags);

  const initialHeaderValue = {
    title: '????????????',
    activeTabName:
      query.role === UserRole.ADMIN
        ? '?????????'
        : query.role === UserRole.COMMON
        ? '????????????'
        : query.role === UserRole.COACH
        ? '?????????'
        : query.role === UserRole.INTERNAL_INSTRUCTOR
        ? '??????(??????)'
        : query.role === UserRole.EXTERNAL_INSTRUCTOR
        ? '??????(??????)'
        : '??????',
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

  const resetSearch = () => {
    setSelectedTags([]);
    queryRefresh({ page: '1', word: '', tag: '' });
  };

  return (
    <LayoutWithTab
      sidebar={{ activeScreenName: SidebarScreenName.USERS }}
      header={initialHeaderValue}>
      <Head>
        <title>???????????? | ????????????</title>
      </Head>
      {/* <TopTabBar topTabBehaviorList={topTabBehaviorList} /> */}
      <SearchForm
        onClearTag={() => setSelectedTags([])}
        onClear={() => resetSearch()}
        // value={searchWord || ''}
        // onChange={(e) => setSearchWord(e.currentTarget.value)}
        // onClickButton={() => queryRefresh({ page: '1', word: searchWord })}
        onClickButton={(w) => queryRefresh({ page: '1', word: w })}
        tags={tags || []}
        selectedTags={selectedTags}
        toggleTag={onToggleTag}
      />
      {!isLoading && !users?.users.length && (
        <Text alignItems="center" textAlign="center" mb={4}>
          ?????????????????????????????????????????????
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
                    page: '1',
                  });
                  return;
                }}>
                <option value="">????????????</option>
                <option value="event">????????????????????????</option>
                <option value="question">????????????</option>
                <option value="answer">????????????</option>
                <option value="knowledge">????????????????????????</option>
              </Select>
            </FormControl>
            <FormControl w="200px" ml="20px">
              <Select
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
                <option value="">????????????</option>
                <option value="tokyo">????????????</option>
                <option value="osaka">????????????</option>
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
                    page: '1',
                  });
                  return;
                }}>
                <option value="">?????????</option>
                <option value="week">??????</option>
                <option value="month">??????</option>
              </Select>
            </FormControl>
          </Box>
          <SimpleGrid minChildWidth="520px" spacing="20px" w="100%">
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
            previousLabel={'??????'}
            nextLabel={'??????'}
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
