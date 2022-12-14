import { Tab } from 'src/types/header/tab/types';
import LayoutWithTab from '@/components/layout/LayoutWithTab';
import { SidebarScreenName } from '@/components/layout/Sidebar';
import React, { useEffect, useState } from 'react';
import userAdminStyles from '@/styles/layouts/UserAdmin.module.scss';
import { Tag, User, UserRole } from 'src/types';
import { useAPIUpdateUser } from '@/hooks/api/user/useAPIUpdateUser';
import { useAPIDeleteUser } from '@/hooks/api/user/useAPIDeleteUser';
import {
  Avatar,
  Box,
  Button,
  Progress,
  Select,
  Text,
  Link as ChakraLink,
  useMediaQuery,
  useToast,
  Spinner,
} from '@chakra-ui/react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useAuthenticate } from 'src/contexts/useAuthenticate';
import {
  SearchQueryToGetUsers,
  useAPISearchUsers,
} from '@/hooks/api/user/useAPISearchUsers';
import SearchForm from '@/components/common/SearchForm';
import { toggleTag } from 'src/utils/toggleTag';
import paginationStyles from '@/styles/components/Pagination.module.scss';
import dynamic from 'next/dynamic';
const ReactPaginate = dynamic(() => import('react-paginate'), { ssr: false });
import { searchUserQueryParamFactory } from 'src/utils/userQueryRefresh';
import { useAPIGetUserTag } from '@/hooks/api/tag/useAPIGetUserTag';
import { useHeaderTab } from '@/hooks/headerTab/useHeaderTab';
import Link from 'next/link';
import { userRoleNameFactory } from 'src/utils/factory/userRoleNameFactory';
import { blueColor } from 'src/utils/colors';
import { FaPen } from 'react-icons/fa';
import { RiDeleteBin6Line } from 'react-icons/ri';
import {
  userRoleNameToValue,
  userRoleValueToName,
} from 'src/utils/userRoleFommater';
import { AiOutlinePlus } from 'react-icons/ai';
import { FiEdit2 } from 'react-icons/fi';
import { MdWork } from 'react-icons/md';
import { userNameFactory } from 'src/utils/factory/userNameFactory';

const UserAdmin: React.FC = () => {
  const router = useRouter();
  const query = router.query as SearchQueryToGetUsers;
  const { data: tags } = useAPIGetUserTag();
  const [searchWord, setSearchWord] = useState(query.word);
  const [isDeletingUser, setIsDeletingUser] = useState(-1);
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const { data: users, refetch, isLoading } = useAPISearchUsers(query);
  const { user } = useAuthenticate();
  const [isSmallerThan768] = useMediaQuery('(max-width: 768px)');
  const { mutate: updateUser } = useAPIUpdateUser({
    onSuccess: () => {
      refetch();
    },
  });
  const [loadingUserRole, setLoadingUserRole] = useState(true);

  const onToggleTag = (t: Tag) => {
    setSelectedTags((s) => toggleTag(s, t));
  };
  const toast = useToast();
  const { mutate: deleteUser } = useAPIDeleteUser({
    onSuccess: (_, user) => {
      setIsDeletingUser(-1);
      refetch();
      toast({
        description: `${userNameFactory(user)} ??????????????????????????????`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    },
  });
  const tabs: Tab[] = useHeaderTab({ headerTabType: 'admin' });

  const onDeleteClicked = (user: User) => {
    if (confirm(`${userNameFactory(user)} ??????????????????????????????????????????`)) {
      setIsDeletingUser(user.id);
      deleteUser(user);
    }
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
    const queryParam = searchUserQueryParamFactory({
      ...normalQuery,
      ...newQuery,
    });
    router.push(`/admin/users${queryParam}`, undefined, { shallow: true });
  };

  const resetSearch = () => {
    setSelectedTags([]);
    setSearchWord('');
    queryRefresh({ page: '1', word: '' });
  };

  useEffect(() => {
    if (user?.role !== UserRole.ADMIN) {
      router.back();
      return;
    }
    setLoadingUserRole(false);
  }, [user, router]);

  useEffect(() => {
    if (tags) {
      const tagParam = query.tag || '';
      const tagsInQueryParams = tagParam.split(' ');
      const searchedTags =
        tags.filter((t) => tagsInQueryParams.includes(t.id.toString())) || [];
      setSelectedTags(searchedTags);
    }
  }, [query.tag, tags]);

  if (loadingUserRole) {
    return <Progress isIndeterminate size="lg" />;
  }

  return (
    <LayoutWithTab
      sidebar={{ activeScreenName: SidebarScreenName.ADMIN }}
      header={{
        title: 'Admin',
        activeTabName: '??????????????????',
        tabs,
      }}>
      <Head>
        <title>???????????? | ??????????????????</title>
      </Head>
      <SearchForm
        onClearTag={() => setSelectedTags([])}
        onClear={() => resetSearch()}
        onClickButton={(w) => queryRefresh({ page: '1', word: w })}
        tags={tags || []}
        selectedTags={selectedTags}
        toggleTag={onToggleTag}
        selectItems={[
          '??????',
          '?????????',
          '????????????',
          '?????????',
          '??????(??????)',
          '??????(??????)',
        ]}
        selectingItem={userRoleValueToName(query.role)}
        onSelect={(e) =>
          queryRefresh({
            page: '1',
            role: userRoleNameToValue(e.target.value),
          })
        }
      />
      {!isLoading && !users?.users.length && (
        <Text alignItems="center" textAlign="center" mb={4}>
          ?????????????????????????????????????????????
        </Text>
      )}
      <ChakraLink w="70px" mb={5} mr={3} ml="auto" href="/admin/users/new">
        <Button
          rounded={50}
          w="80px"
          h="35px"
          colorScheme="brand"
          rightIcon={<AiOutlinePlus />}>
          ??????
        </Button>
      </ChakraLink>

      <div className={userAdminStyles.table_wrapper}>
        <table className={userAdminStyles.table}>
          <tbody>
            <tr className={userAdminStyles.table_head_wrapper}>
              <th className={userAdminStyles.table_head} />
              <th className={userAdminStyles.table_head}>???</th>
              <th className={userAdminStyles.table_head}>???</th>
              {!isSmallerThan768 ? (
                <th className={userAdminStyles.table_head}>?????????????????????</th>
              ) : null}
              {/* <th className={userAdminStyles.table_head}>?????????????????????</th> */}
              <th className={userAdminStyles.table_head}>????????????</th>
              <th className={userAdminStyles.table_head}>??????</th>
              <th className={userAdminStyles.table_head}>??????</th>
              <th className={userAdminStyles.table_head}>??????</th>
              <th className={userAdminStyles.table_head} />
            </tr>
            {users?.users?.map((u) => (
              <tr key={u.id} className={userAdminStyles.user_row_wrapper}>
                <td className={userAdminStyles.avatar_wrapper}>
                  <Link href={`/account/${u?.id}`} passHref>
                    <a>
                      <Avatar size="md" src={u.avatarUrl} />
                    </a>
                  </Link>
                </td>
                <td className={userAdminStyles.user_info_text}>{u.lastName}</td>
                <td className={userAdminStyles.user_info_text}>
                  {u.firstName}
                </td>
                {!isSmallerThan768 ? (
                  <td className={userAdminStyles.user_info_text}>{u.email}</td>
                ) : null}
                {/* <td className={userAdminStyles.user_info_text}>{u.email}</td> */}
                <td className={userAdminStyles.user_info_text}>
                  {userRoleValueToName(u.role)}
                </td>

                <td className={userAdminStyles.delete_icon_wrapper}>
                  <Link href={`/admin/attendance/view/${u.id}`} passHref>
                    <a>
                      <MdWork
                        className={userAdminStyles.delete_icon}
                        color={'orange'}
                      />
                    </a>
                  </Link>
                </td>
                <td className={userAdminStyles.delete_icon_wrapper}>
                  <Link href={`/admin/users/editProfile/${u.id}`} passHref>
                    <a>
                      <FiEdit2
                        className={userAdminStyles.delete_icon}
                        // color={blueColor}
                      />
                    </a>
                  </Link>
                </td>

                <td className={userAdminStyles.delete_icon_wrapper}>
                  {isDeletingUser == u.id ? (
                    <Spinner />
                  ) : (
                    <RiDeleteBin6Line
                      onClick={() => onDeleteClicked(u)}
                      className={userAdminStyles.delete_icon}
                      // color="tomato"
                    />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {typeof window !== 'undefined' && users && users.pageCount ? (
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

export default UserAdmin;
