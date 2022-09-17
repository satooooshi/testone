import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import {useFocusEffect} from '@react-navigation/native';
import React, {useCallback, useEffect, useState} from 'react';
import {FlatList} from 'react-native';
import {Text, Div} from 'react-native-magnus';
import {ActivityIndicator} from 'react-native-paper';
import UserRow from '../../../components/admin/UesrRow';
import SearchForm from '../../../components/common/SearchForm';
import SearchFormOpenerButton from '../../../components/common/SearchForm/SearchFormOpenerButton';
import HeaderWithTextButton from '../../../components/Header';
import WholeContainer from '../../../components/WholeContainer';
import {useAPIGetUserTag} from '../../../hooks/api/tag/useAPIGetUserTag';
import {User, UserRole, UserTag} from '../../../types';
import {userRoleNameFactory} from '../../../utils/factory/userRoleNameFactory';
import {userAdminStyles} from '../../../styles/screen/admin/userAdmin.style';
import {
  SearchQueryToGetUsers,
  useAPISearchUsers,
} from '../../../hooks/api/user/useAPISearchUsers';

const TopTab = createMaterialTopTabNavigator();

const UserAdmin: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<SearchQueryToGetUsers>({
    page: '1',
    //role: UserRole.COACH,
  });
  const [selectedTags, setSelectedTags] = useState<UserTag[]>([]);
  const {
    data: users,
    isLoading,
    refetch,
    isRefetching,
  } = useAPISearchUsers(searchQuery);
  const {data: tags} = useAPIGetUserTag();
  const [visibleSearchFormModal, setVisibleSearchFormModal] = useState(false);
  const queryRefresh = (
    query: Partial<SearchQueryToGetUsers>,
    selected?: UserTag[],
  ) => {
    const selectedTagIDs = selected?.map(t => t.id.toString());
    const tagQuery = selectedTagIDs?.join('+');

    setUsersForInfiniteScroll([]);
    selected && setSelectedTags(selected);
    setSearchQuery(q => ({...q, ...query, page: '1', tag: tagQuery || ''}));
  };
  const [usersForInfiniteScroll, setUsersForInfiniteScroll] = useState<User[]>(
    [],
  );

  const onEndReached = () => {
    setSearchQuery(q => ({...q, page: (Number(q.page) + 1).toString()}));
  };

  useFocusEffect(
    useCallback(() => {
      setUsersForInfiniteScroll([]);
      setSearchQuery(q => ({...q, page: '1'}));
      refetch();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  useEffect(() => {
    if (!isRefetching && users?.users.length) {
      setUsersForInfiniteScroll(u => {
        if (u.length && u[0].id !== users.users[0].id) {
          return [...u, ...users.users];
        }
        return users.users;
      });
    }
  }, [users?.users, isRefetching]);

  useEffect(() => {
    const tagIDs = searchQuery.tag?.split('+') || [];
    if (tags?.length && tagIDs.length) {
      setSelectedTags(tags.filter(t => tagIDs.includes(t.id.toString())));
    }
  }, [searchQuery.tag, tags]);

  const topTabNames = [
    'AllRole',
    UserRole.ADMIN,
    UserRole.COMMON,
    UserRole.COACH,
    UserRole.INTERNAL_INSTRUCTOR,
    UserRole.EXTERNAL_INSTRUCTOR,
  ];
  return (
    <WholeContainer>
      <HeaderWithTextButton title="Admin" />
      <SearchForm
        searchTarget="user"
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
      <TopTab.Navigator
        tabBarOptions={{
          labelStyle: {
            fontSize: 14,
            color: 'black',
            fontWeight: '500',
            font: 'YuGothic',
            lineHeight: 20,
          },
          tabStyle: {width: 100, padding: 0},
          style: {
            backgroundColor: '#FFFFFF',
          },
        }}
        initialRouteName={topTabNames[0]}
        screenOptions={{tabBarScrollEnabled: true}}>
        <TopTab.Screen
          name={topTabNames[0]}
          children={() => (
            <Div px={16}>
              {usersForInfiniteScroll.length ? (
                <FlatList
                  data={usersForInfiniteScroll}
                  {...{onEndReached}}
                  onEndReachedThreshold={0.5}
                  keyExtractor={item => item.id.toString()}
                  ListHeaderComponent={<Div h={10} />}
                  renderItem={({item}) => <UserRow user={item} />}
                />
              ) : (
                <Text fontSize={16}>検索結果が見つかりませんでした</Text>
              )}
            </Div>
          )}
          options={{title: '全て'}}
        />
        <TopTab.Screen
          name={topTabNames[1]}
          children={() => {
            const users = usersForInfiniteScroll.filter(
              u => u.role === UserRole.ADMIN,
            );
            return (
              <Div px={16}>
                {users.length ? (
                  <FlatList
                    data={users}
                    {...{onEndReached}}
                    onEndReachedThreshold={0.5}
                    keyExtractor={item => item.id.toString()}
                    ListHeaderComponent={<Div h={10} />}
                    renderItem={({item}) => <UserRow user={item} />}
                  />
                ) : (
                  <Text fontSize={16}>検索結果が見つかりませんでした</Text>
                )}
              </Div>
            );
          }}
          options={{title: userRoleNameFactory(UserRole.ADMIN)}}
        />
        <TopTab.Screen
          name={topTabNames[2]}
          children={() => {
            const users = usersForInfiniteScroll.filter(
              u => u.role === UserRole.COMMON,
            );
            return (
              <Div px={16}>
                {users.length ? (
                  <FlatList
                    data={users}
                    {...{onEndReached}}
                    onEndReachedThreshold={0.5}
                    keyExtractor={item => item.id.toString()}
                    ListHeaderComponent={<Div h={10} />}
                    renderItem={({item}) => <UserRow user={item} />}
                  />
                ) : (
                  <Text fontSize={16}>検索結果が見つかりませんでした</Text>
                )}
              </Div>
            );
          }}
          options={{title: userRoleNameFactory(UserRole.COMMON)}}
        />
        <TopTab.Screen
          name={topTabNames[3]}
          children={() => {
            const users = usersForInfiniteScroll.filter(
              u => u.role === UserRole.COACH,
            );
            return (
              <Div px={16}>
                {users.length ? (
                  <FlatList
                    data={users}
                    {...{onEndReached}}
                    onEndReachedThreshold={0.5}
                    keyExtractor={item => item.id.toString()}
                    ListHeaderComponent={<Div h={10} />}
                    renderItem={({item}) => <UserRow user={item} />}
                  />
                ) : (
                  <Text fontSize={16}>検索結果が見つかりませんでした</Text>
                )}
              </Div>
            );
          }}
          options={{title: userRoleNameFactory(UserRole.COACH)}}
        />
        <TopTab.Screen
          name={topTabNames[4]}
          children={() => {
            const users = usersForInfiniteScroll.filter(
              u => u.role === UserRole.INTERNAL_INSTRUCTOR,
            );
            return (
              <Div px={16}>
                {users.length ? (
                  <FlatList
                    data={users}
                    {...{onEndReached}}
                    onEndReachedThreshold={0.5}
                    keyExtractor={item => item.id.toString()}
                    ListHeaderComponent={<Div h={10} />}
                    renderItem={({item}) => <UserRow user={item} />}
                  />
                ) : (
                  <Text fontSize={16}>検索結果が見つかりませんでした</Text>
                )}
              </Div>
            );
          }}
          options={{title: userRoleNameFactory(UserRole.INTERNAL_INSTRUCTOR)}}
        />
        <TopTab.Screen
          name={topTabNames[5]}
          children={() => {
            const users = usersForInfiniteScroll.filter(
              u => u.role === UserRole.EXTERNAL_INSTRUCTOR,
            );
            return (
              <Div px={16}>
                {users.length ? (
                  <FlatList
                    data={users}
                    {...{onEndReached}}
                    onEndReachedThreshold={0.5}
                    keyExtractor={item => item.id.toString()}
                    ListHeaderComponent={<Div h={10} />}
                    renderItem={({item}) => <UserRow user={item} />}
                  />
                ) : (
                  <Text fontSize={16}>検索結果が見つかりませんでした</Text>
                )}
              </Div>
            );
          }}
          options={{title: userRoleNameFactory(UserRole.EXTERNAL_INSTRUCTOR)}}
        />
      </TopTab.Navigator>
      {isLoading && <ActivityIndicator />}
    </WholeContainer>
  );
};

export default UserAdmin;
