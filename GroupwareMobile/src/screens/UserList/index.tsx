import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import {useIsFocused, useRoute} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
import SearchForm from '../../components/common/SearchForm';
import SearchFormOpenerButton from '../../components/common/SearchForm/SearchFormOpenerButton';
import HeaderWithTextButton from '../../components/Header';
import WholeContainer from '../../components/WholeContainer';
import {
  SearchQueryToGetUsers,
  useAPISearchUsers,
} from '../../hooks/api/user/useAPISearchUsers';
import {User, UserRole} from '../../types';
import {UsersListRouteProps} from '../../types/navigator/drawerScreenProps';
import {userRoleNameFactory} from '../../utils/factory/userRoleNameFactory';
import UserCardList from './UserCardList';

const TopTab = createMaterialTopTabNavigator();

const UserList: React.FC = () => {
  const tagPassedByRouteParam = useRoute<UsersListRouteProps>()?.params?.tag;
  const [visibleSearchFormModal, setVisibleSearchFormModal] = useState(false);
  const [word, setWord] = useState('');
  const [tag, setTag] = useState(tagPassedByRouteParam || '');
  const [searchQuery, setSearchQuery] = useState<SearchQueryToGetUsers>({
    page: '1',
  });
  const {isLoading, refetch} = useAPISearchUsers(
    {
      ...searchQuery,
      page: searchQuery?.page || '1',
      word,
      tag,
    },
    {
      enabled: false,
      onSuccess: fetchedUser => {
        setUsersForInfiniteScroll(u => {
          if (u.length && searchQuery?.page !== '1') {
            return [...u, ...fetchedUser.users];
          }
          return fetchedUser.users;
        });
      },
    },
  );
  const [usersForInfiniteScroll, setUsersForInfiniteScroll] = useState<User[]>(
    [],
  );

  useEffect(() => {
    setSearchQuery(q => ({...q, word, tag, page: '1'}));
  }, [tag, word]);

  useEffect(() => {
    if (searchQuery.page) {
      refetch();
    }
  }, [searchQuery, refetch]);

  const topTabNames = [
    'AllRole',
    UserRole.ADMIN,
    UserRole.COMMON,
    UserRole.COACH,
    UserRole.INTERNAL_INSTRUCTOR,
    UserRole.EXTERNAL_INSTRUCTOR,
  ];

  useEffect(() => {
    if (tagPassedByRouteParam) {
      setTag(tagPassedByRouteParam);
    }
  }, [tagPassedByRouteParam]);

  return (
    <WholeContainer>
      <SearchForm
        searchTarget="user"
        defaultSelectedTagIds={tag?.split('+').map(t => Number(t))}
        isVisible={visibleSearchFormModal}
        onCloseModal={() => setVisibleSearchFormModal(false)}
        onSubmit={values => {
          setWord(values.word);
          setTag(values.selectedTags?.map(t => t.id.toString()).join('+'));
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
              userList={usersForInfiniteScroll}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              isLoading={isLoading}
              userRole={undefined}
            />
          )}
          options={{title: '全て'}}
        />
        <TopTab.Screen
          name={topTabNames[1]}
          children={() => (
            <UserCardList
              userList={usersForInfiniteScroll}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              isLoading={isLoading}
              userRole={UserRole.ADMIN}
            />
          )}
          options={{title: userRoleNameFactory(UserRole.ADMIN)}}
        />
        <TopTab.Screen
          name={topTabNames[2]}
          children={() => (
            <UserCardList
              userList={usersForInfiniteScroll}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              isLoading={isLoading}
              userRole={UserRole.COMMON}
            />
          )}
          options={{title: userRoleNameFactory(UserRole.COMMON)}}
        />
        <TopTab.Screen
          name={topTabNames[3]}
          children={() => (
            <UserCardList
              userList={usersForInfiniteScroll}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              isLoading={isLoading}
              userRole={UserRole.COACH}
            />
          )}
          options={{title: userRoleNameFactory(UserRole.COACH)}}
        />
        <TopTab.Screen
          name={topTabNames[4]}
          children={() => (
            <UserCardList
              userList={usersForInfiniteScroll}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              isLoading={isLoading}
              userRole={UserRole.INTERNAL_INSTRUCTOR}
            />
          )}
          options={{title: userRoleNameFactory(UserRole.INTERNAL_INSTRUCTOR)}}
        />
        <TopTab.Screen
          name={topTabNames[5]}
          children={() => (
            <UserCardList
              userList={usersForInfiniteScroll}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              isLoading={isLoading}
              userRole={UserRole.EXTERNAL_INSTRUCTOR}
            />
          )}
          options={{title: userRoleNameFactory(UserRole.EXTERNAL_INSTRUCTOR)}}
        />
      </TopTab.Navigator>
    </WholeContainer>
  );
};

export default UserList;
