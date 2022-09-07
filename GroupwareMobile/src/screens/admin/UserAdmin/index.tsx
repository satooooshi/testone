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
import {useAdminHeaderTab} from '../../../contexts/admin/useAdminHeaderTab';
import {useAPIGetUserTag} from '../../../hooks/api/tag/useAPIGetUserTag';
import {
  SearchQueryToGetUsers,
  useAPISearchUsers,
} from '../../../hooks/api/user/useAPISearchUsers';
import {User, UserTag} from '../../../types';

const UserAdmin: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<SearchQueryToGetUsers>({
    page: '1',
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

  const tabs = useAdminHeaderTab();

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

  return (
    <WholeContainer>
      <HeaderWithTextButton
        title="Admin"
        tabs={tabs}
        activeTabName={'ユーザー管理'}
      />
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
      {isLoading && <ActivityIndicator />}
    </WholeContainer>
  );
};

export default UserAdmin;
