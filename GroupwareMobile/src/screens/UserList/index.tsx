import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import React, {useEffect, useState} from 'react';
import SearchForm from '../../components/common/SearchForm';
import SearchFormOpenerButton from '../../components/common/SearchForm/SearchFormOpenerButton';
import HeaderWithTextButton from '../../components/Header';
import WholeContainer from '../../components/WholeContainer';
import {useAPIGetUserTag} from '../../hooks/api/tag/useAPIGetUserTag';
import {
  SearchQueryToGetUsers,
  useAPISearchUsers,
} from '../../hooks/api/user/useAPISearchUsers';
import {User, UserRole, UserTag} from '../../types';
import {userRoleNameFactory} from '../../utils/factory/userRoleNameFactory';
import UserCardList from './UserCardList';

const TopTab = createMaterialTopTabNavigator();

const UserList: React.FC = () => {
  const {data: tags} = useAPIGetUserTag();
  const [searchQuery, setSearchQuery] = useState<SearchQueryToGetUsers>({
    page: '1',
  });
  const {data: users, isLoading} = useAPISearchUsers(searchQuery);
  const [usersForInfiniteScroll, setUsersForInfiniteScroll] = useState<User[]>(
    [],
  );
  const [visibleSearchFormModal, setVisibleSearchFormModal] = useState(false);
  const topTabNames = [
    'AllRole',
    UserRole.ADMIN,
    UserRole.COMMON,
    UserRole.COACH,
    UserRole.INTERNAL_INSTRUCTOR,
    UserRole.EXTERNAL_INSTRUCTOR,
  ];
  const [selectedTags, setSelectedTags] = useState<UserTag[]>([]);
  const queryRefresh = (
    query: Partial<SearchQueryToGetUsers>,
    selected?: UserTag[],
  ) => {
    const selectedTagIDs = selected?.map(t => t.id.toString());
    const tagQuery = selectedTagIDs?.join('+');

    setSearchQuery(q => ({...q, ...query, tag: tagQuery || ''}));
  };

  useEffect(() => {
    if (users?.users) {
      setUsersForInfiniteScroll(u => {
        if (u.length) {
          return [...u, ...users.users];
        }
        return users?.users;
      });
    }
  }, [users?.users]);

  useEffect(() => {
    const tagIDs = searchQuery.tag?.split('+') || [];
    if (tags?.length && tagIDs.length) {
      setSelectedTags(tags.filter(t => tagIDs.includes(t.id.toString())));
    }
  }, [searchQuery.tag, tags]);

  return (
    <WholeContainer>
      <SearchForm
        defaultValue={{word: '', selectedTags}}
        isVisible={visibleSearchFormModal}
        onCloseModal={() => setVisibleSearchFormModal(false)}
        onSubmit={values => {
          queryRefresh({word: values.word}, values.selectedTags);
          setVisibleSearchFormModal(false);
        }}
      />
      <SearchFormOpenerButton
        bottom={10}
        right={10}
        onPress={() => setVisibleSearchFormModal(true)}
      />
      <HeaderWithTextButton title="社員名鑑" />
      <TopTab.Navigator
        initialRouteName={topTabNames[0]}
        screenOptions={{tabBarScrollEnabled: true}}>
        <TopTab.Screen
          name={topTabNames[0]}
          children={() => (
            <UserCardList
              isLoading={isLoading}
              userRole={'All'}
              searchResult={usersForInfiniteScroll}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              setUsers={setUsersForInfiniteScroll}
            />
          )}
          options={{title: '全て'}}
        />
        <TopTab.Screen
          name={topTabNames[1]}
          children={() => (
            <UserCardList
              isLoading={isLoading}
              userRole={UserRole.ADMIN}
              searchResult={usersForInfiniteScroll}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              setUsers={setUsersForInfiniteScroll}
            />
          )}
          options={{title: userRoleNameFactory(UserRole.ADMIN)}}
        />
        <TopTab.Screen
          name={topTabNames[2]}
          children={() => (
            <UserCardList
              isLoading={isLoading}
              userRole={UserRole.COMMON}
              searchResult={usersForInfiniteScroll}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              setUsers={setUsersForInfiniteScroll}
            />
          )}
          options={{title: userRoleNameFactory(UserRole.COMMON)}}
        />
        <TopTab.Screen
          name={topTabNames[3]}
          children={() => (
            <UserCardList
              isLoading={isLoading}
              userRole={UserRole.COACH}
              searchResult={usersForInfiniteScroll}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              setUsers={setUsersForInfiniteScroll}
            />
          )}
          options={{title: userRoleNameFactory(UserRole.COACH)}}
        />
        <TopTab.Screen
          name={topTabNames[4]}
          children={() => (
            <UserCardList
              isLoading={isLoading}
              userRole={UserRole.INTERNAL_INSTRUCTOR}
              searchResult={usersForInfiniteScroll}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              setUsers={setUsersForInfiniteScroll}
            />
          )}
          options={{title: userRoleNameFactory(UserRole.INTERNAL_INSTRUCTOR)}}
        />
        <TopTab.Screen
          name={topTabNames[5]}
          children={() => (
            <UserCardList
              isLoading={isLoading}
              userRole={UserRole.EXTERNAL_INSTRUCTOR}
              searchResult={usersForInfiniteScroll}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              setUsers={setUsersForInfiniteScroll}
            />
          )}
          options={{title: userRoleNameFactory(UserRole.EXTERNAL_INSTRUCTOR)}}
        />
      </TopTab.Navigator>
    </WholeContainer>
  );
};

export default UserList;
