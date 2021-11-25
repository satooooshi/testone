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
import {UserRole, UserTag} from '../../types';
import {userRoleNameFactory} from '../../utils/factory/userRoleNameFactory';
import UserCardList from './UserCardList';

const TopTab = createMaterialTopTabNavigator();

const UserList: React.FC = () => {
  const {data: tags} = useAPIGetUserTag();
  const [searchQuery, setSearchQuery] = useState<SearchQueryToGetUsers>({
    page: '1',
  });
  const {data: users} = useAPISearchUsers(searchQuery);
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
        tags={tags || []}
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
              userRole={'All'}
              searchResult={users}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />
          )}
          options={{title: '全て'}}
        />
        <TopTab.Screen
          name={topTabNames[1]}
          children={() => (
            <UserCardList
              userRole={UserRole.ADMIN}
              searchResult={users}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />
          )}
          options={{title: userRoleNameFactory(UserRole.ADMIN)}}
        />
        <TopTab.Screen
          name={topTabNames[2]}
          children={() => (
            <UserCardList
              userRole={UserRole.COMMON}
              searchResult={users}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />
          )}
          options={{title: userRoleNameFactory(UserRole.COMMON)}}
        />
        <TopTab.Screen
          name={topTabNames[3]}
          children={() => (
            <UserCardList
              userRole={UserRole.COACH}
              searchResult={users}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />
          )}
          options={{title: userRoleNameFactory(UserRole.COACH)}}
        />
        <TopTab.Screen
          name={topTabNames[4]}
          children={() => (
            <UserCardList
              userRole={UserRole.INTERNAL_INSTRUCTOR}
              searchResult={users}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />
          )}
          options={{title: userRoleNameFactory(UserRole.INTERNAL_INSTRUCTOR)}}
        />
        <TopTab.Screen
          name={topTabNames[5]}
          children={() => (
            <UserCardList
              userRole={UserRole.EXTERNAL_INSTRUCTOR}
              searchResult={users}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />
          )}
          options={{title: userRoleNameFactory(UserRole.EXTERNAL_INSTRUCTOR)}}
        />
      </TopTab.Navigator>
    </WholeContainer>
  );
};

export default UserList;
