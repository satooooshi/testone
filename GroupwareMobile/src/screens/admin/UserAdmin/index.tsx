import {useNavigation} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
import {FlatList} from 'react-native';
import {Text, Div} from 'react-native-magnus';
import {ActivityIndicator} from 'react-native-paper';
import UserRow from '../../../components/admin/UesrRow';
import SearchForm from '../../../components/common/SearchForm';
import SearchFormOpenerButton from '../../../components/common/SearchForm/SearchFormOpenerButton';
import HeaderWithTextButton from '../../../components/Header';
import {Tab} from '../../../components/Header/HeaderTemplate';
import WholeContainer from '../../../components/WholeContainer';
import {useAPIGetUserTag} from '../../../hooks/api/tag/useAPIGetUserTag';
import {
  SearchQueryToGetUsers,
  useAPISearchUsers,
} from '../../../hooks/api/user/useAPISearchUsers';
import {User, UserTag} from '../../../types';
import {UserAdminNavigationProps} from '../../../types/navigator/drawerScreenProps';

const UserAdmin: React.FC = () => {
  const navigation = useNavigation<UserAdminNavigationProps>();
  const [searchQuery, setSearchQuery] = useState<SearchQueryToGetUsers>({
    page: '1',
  });
  const [selectedTags, setSelectedTags] = useState<UserTag[]>([]);
  const {data: users, isLoading} = useAPISearchUsers(searchQuery);
  const {data: tags} = useAPIGetUserTag();
  const [visibleSearchFormModal, setVisibleSearchFormModal] = useState(false);
  const queryRefresh = (
    query: Partial<SearchQueryToGetUsers>,
    selected?: UserTag[],
  ) => {
    const selectedTagIDs = selected?.map(t => t.id.toString());
    const tagQuery = selectedTagIDs?.join('+');

    setUsersForInfiniteScroll([]);
    setSearchQuery(q => ({...q, ...query, page: '1', tag: tagQuery || ''}));
  };
  const [usersForInfiniteScroll, setUsersForInfiniteScroll] = useState<User[]>(
    [],
  );

  const tabs: Tab[] = [
    {
      name: 'ユーザー管理',
      onPress: () => {},
    },
    {
      name: 'ユーザー作成',
      onPress: () =>
        navigation.navigate('AdminStack', {screen: 'UserRegisteringAdmin'}),
    },
    {
      name: 'タグ管理',
      onPress: () => navigation.navigate('AdminStack', {screen: 'TagAdmin'}),
    },
    {
      name: 'タグ管理(ユーザー)',
      onPress: () =>
        navigation.navigate('AdminStack', {screen: 'UserTagAdmin'}),
    },
  ];

  const onEndReached = () => {
    setSearchQuery(q => ({...q, page: (Number(q.page) + 1).toString()}));
  };

  useEffect(() => {
    if (users?.users?.length) {
      setUsersForInfiniteScroll(u => {
        return [...u, ...users.users];
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
      <HeaderWithTextButton
        title="Admin"
        tabs={tabs}
        activeTabName={'ユーザー管理'}
      />
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
      <Div
        borderBottomWidth={1}
        borderBottomColor={'#b0b0b0'}
        flexDir="row"
        h={60}>
        <Div minW={'20%'} />
        <Div minW={'30%'} justifyContent="center">
          <Text fontWeight="bold" fontSize={16}>
            {'名前\nメールアドレス'}
          </Text>
        </Div>
        <Div minW={'40%'} justifyContent="center">
          <Text fontWeight="bold" fontSize={16}>
            社員区分
          </Text>
        </Div>
        <Div minW={'10%'} />
      </Div>

      {usersForInfiniteScroll.length ? (
        <FlatList
          data={usersForInfiniteScroll}
          {...{onEndReached}}
          keyExtractor={item => item.id.toString()}
          renderItem={({item}) => <UserRow user={item} />}
        />
      ) : (
        <Text fontSize={16}>検索結果が見つかりませんでした</Text>
      )}
      {isLoading && <ActivityIndicator />}
    </WholeContainer>
  );
};

export default UserAdmin;
