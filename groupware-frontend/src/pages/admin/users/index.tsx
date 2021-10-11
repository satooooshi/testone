import { Tab } from 'src/types/header/tab/types';
import LayoutWithTab from '@/components/layout/LayoutWithTab';
import { ScreenName } from '@/components/layout/Sidebar';
import React, { useEffect, useState } from 'react';
import { MdDelete } from 'react-icons/md';
import userAdminStyles from '@/styles/layouts/UserAdmin.module.scss';
import { Tag, User, UserRole } from 'src/types';
import { useAPIUpdateUser } from '@/hooks/api/user/useAPIUpdateUser';
import { useAPIDeleteUser } from '@/hooks/api/user/useAPIDeleteUser';
import { Avatar, Button, Select } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useAuthenticate } from 'src/contexts/useAuthenticate';
import {
  SearchQueryToGetUsers,
  useAPISearchUsers,
} from '@/hooks/api/user/useAPISearchUsers';
import SearchForm from '@/components/SearchForm';
import { toggleTag } from 'src/utils/toggleTag';
import paginationStyles from '@/styles/components/Pagination.module.scss';
import ReactPaginate from 'react-paginate';
import { searchUserQueryParamFactory } from 'src/utils/userQueryRefresh';
import { useAPIGetUserTag } from '@/hooks/api/tag/useAPIGetUserTag';
import { useHeaderTab } from '@/hooks/headerTab/useHeaderTab';

const UserAdmin: React.FC = () => {
  const router = useRouter();
  const query = router.query as SearchQueryToGetUsers;
  const { data: tags } = useAPIGetUserTag();
  const [searchWord, setSearchWord] = useState('');
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const { data: users, refetch } = useAPISearchUsers(query);
  const { user } = useAuthenticate();
  const { mutate: updateUser } = useAPIUpdateUser({
    onSuccess: () => {
      refetch();
    },
  });

  const onToggleTag = (t: Tag) => {
    setSelectedTags((s) => toggleTag(s, t));
  };
  const { mutate: deleteUser } = useAPIDeleteUser({
    onSuccess: () => {
      refetch();
    },
  });
  const tabs: Tab[] = useHeaderTab({ headerTabType: 'admin' });

  const onDeleteClicked = (user: User) => {
    if (
      confirm(`${user.lastName} ${user.firstName}さんを削除して宜しいですか？`)
    ) {
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
      role: query.role,
      duration: query.duration,
    };
    const queryParam = searchUserQueryParamFactory({
      ...normalQuery,
      ...newQuery,
    });
    router.push(`/admin/users${queryParam}`, undefined, { shallow: true });
  };

  useEffect(() => {
    if (user?.role !== UserRole.ADMIN) {
      router.back();
    }
  }, [user, router]);

  return (
    <LayoutWithTab
      sidebar={{ activeScreenName: ScreenName.ADMIN }}
      header={{
        title: 'Admin',
        activeTabName: 'ユーザー管理',
        tabs,
      }}>
      <Head>
        <title>ボールド | ユーザー管理</title>
      </Head>
      <div className={userAdminStyles.search_form_wrapper}>
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
      <div className={userAdminStyles.table_wrapper}>
        <table className={userAdminStyles.table}>
          <tr className={userAdminStyles.table_head_wrapper}>
            <th className={userAdminStyles.table_head} />
            <th className={userAdminStyles.table_head}>姓</th>
            <th className={userAdminStyles.table_head}>名前</th>
            <th className={userAdminStyles.table_head}>メールアドレス</th>
            <th className={userAdminStyles.table_head}>社員区分</th>
            <th className={userAdminStyles.table_head}>認証</th>
            <th className={userAdminStyles.table_head} />
          </tr>
          {users?.users?.map((u) => (
            <tr key={u.id} className={userAdminStyles.user_row_wrapper}>
              <td className={userAdminStyles.avatar_wrapper}>
                <Avatar size="md" src={u.avatarUrl} />
              </td>
              <td className={userAdminStyles.user_info_text}>{u.lastName}</td>
              <td className={userAdminStyles.user_info_text}>{u.firstName}</td>
              <td className={userAdminStyles.user_info_text}>{u.email}</td>
              <td className={userAdminStyles.user_info_text}>
                <Select
                  name="roles"
                  colorScheme="teal"
                  bg="white"
                  width="80%"
                  className={userAdminStyles.roles}
                  onChange={(e) =>
                    updateUser({ ...u, role: e.target.value as UserRole })
                  }
                  defaultValue={u.role}>
                  <option value={UserRole.ADMIN}>管理者</option>
                  <option value={UserRole.INSTRUCTOR}>講師</option>
                  <option value={UserRole.HEAD_OFFICE}>本社勤務</option>
                  <option value={UserRole.COMMON}>一般社員</option>
                </Select>
              </td>
              <td className={userAdminStyles.verified_button_wrapper}>
                {u.verifiedAt ? (
                  <Button
                    colorScheme="green"
                    height="32px"
                    onClick={() =>
                      updateUser({ ...u, verifiedAt: new Date() })
                    }>
                    認証済み
                  </Button>
                ) : (
                  <Button
                    colorScheme="green"
                    height="32px"
                    onClick={() =>
                      updateUser({ ...u, verifiedAt: new Date() })
                    }>
                    承認する
                  </Button>
                )}
              </td>
              <td className={userAdminStyles.delete_icon_wrapper}>
                <MdDelete
                  onClick={() => onDeleteClicked(u)}
                  className={userAdminStyles.delete_icon}
                />
              </td>
            </tr>
          ))}
        </table>
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

export default UserAdmin;
