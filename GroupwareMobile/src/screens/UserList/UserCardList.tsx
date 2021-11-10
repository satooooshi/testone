import {useIsFocused} from '@react-navigation/native';
import React, {Dispatch, SetStateAction, useEffect, useRef} from 'react';
import {FlatList} from 'react-native';
import {Div, Dropdown} from 'react-native-magnus';
import DropdownOpenerButton from '../../components/common/DropdownOpenerButton';
import UserCard from '../../components/users/UserCard';
import {
  SearchQueryToGetUsers,
  SearchResultToGetUsers,
} from '../../hooks/api/user/useAPISearchUsers';
import {userListStyles} from '../../styles/screen/user/userList.style';
import {UserRoleInApp} from '../../types';
import {UserListNavigationProps} from '../../types/navigator/screenProps/UserList';
import {
  defaultDropdownProps,
  defaultDropdownOptionProps,
} from '../../utils/dropdown/helper';

type UserCardListProps = {
  userRole: UserRoleInApp;
  searchResult: SearchResultToGetUsers | undefined;
  navigation: UserListNavigationProps;
  searchQuery: SearchQueryToGetUsers;
  setSearchQuery: Dispatch<SetStateAction<SearchQueryToGetUsers>>;
};

const UserCardList: React.FC<UserCardListProps> = ({
  userRole,
  searchResult,
  navigation,
  searchQuery,
  setSearchQuery,
}) => {
  const isFocused = useIsFocused();
  const sortDropdownRef = useRef<any | null>(null);
  const durationDropdownRef = useRef<any | null>(null);

  useEffect(() => {
    if (isFocused) {
      if (userRole === 'All') {
        setSearchQuery(q => ({...q, role: undefined}));
      } else {
        setSearchQuery(q => ({...q, role: userRole}));
      }
    }
  }, [isFocused, setSearchQuery, userRole]);

  const sortDropdownButtonName = () => {
    switch (searchQuery.sort) {
      case 'event':
        return 'イベント参加数順';
      case 'question':
        return '質問数順';
      case 'answer':
        return '回答数順';
      case 'knowledge':
        return 'ナレッジ投稿数順';
      default:
        return '指定なし';
    }
  };

  const durationDropdownButtonName = () => {
    switch (searchQuery.duration) {
      case 'week':
        return '週間';
      case 'month':
        return '月間';
      default:
        return '指定なし';
    }
  };

  return (
    <>
      <Div flexDir="row" my="lg" justifyContent="space-evenly">
        <Div w="45%">
          <DropdownOpenerButton
            name={sortDropdownButtonName()}
            onPress={() => sortDropdownRef.current?.open()}
          />
        </Div>
        <Div w="45%">
          <DropdownOpenerButton
            name={durationDropdownButtonName()}
            onPress={() => durationDropdownRef.current?.open()}
          />
        </Div>
        <Dropdown ref={sortDropdownRef} {...defaultDropdownProps}>
          <Dropdown.Option
            {...defaultDropdownOptionProps}
            value={'none'}
            onPress={() => setSearchQuery(q => ({...q, sort: undefined}))}>
            指定なし
          </Dropdown.Option>
          <Dropdown.Option
            {...defaultDropdownOptionProps}
            value={'none'}
            onPress={() => setSearchQuery(q => ({...q, sort: 'event'}))}>
            イベント参加数順
          </Dropdown.Option>
          <Dropdown.Option
            {...defaultDropdownOptionProps}
            value={'none'}
            onPress={() => setSearchQuery(q => ({...q, sort: 'question'}))}>
            質問数順
          </Dropdown.Option>
          <Dropdown.Option
            {...defaultDropdownOptionProps}
            value={'none'}
            onPress={() => setSearchQuery(q => ({...q, sort: 'answer'}))}>
            回答数順
          </Dropdown.Option>
          <Dropdown.Option
            {...defaultDropdownOptionProps}
            value={'none'}
            onPress={() => setSearchQuery(q => ({...q, sort: 'knowledge'}))}>
            ナレッジ投稿数順
          </Dropdown.Option>
        </Dropdown>
        <Dropdown ref={durationDropdownRef} {...defaultDropdownProps}>
          <Dropdown.Option
            {...defaultDropdownOptionProps}
            value={'none'}
            onPress={() => setSearchQuery(q => ({...q, duration: undefined}))}>
            指定なし
          </Dropdown.Option>
          <Dropdown.Option
            {...defaultDropdownOptionProps}
            value={'none'}
            onPress={() => setSearchQuery(q => ({...q, duration: 'week'}))}>
            週間
          </Dropdown.Option>
          <Dropdown.Option
            {...defaultDropdownOptionProps}
            value={'none'}
            onPress={() => setSearchQuery(q => ({...q, duration: 'month'}))}>
            月間
          </Dropdown.Option>
        </Dropdown>
      </Div>
      {searchResult && searchResult.users ? (
        <FlatList
          data={searchResult.users}
          contentContainerStyle={userListStyles.flatlist}
          renderItem={({item: u}) => (
            <Div mb={'lg'}>
              <UserCard
                filteredDuration={searchQuery.duration}
                onPress={() => navigation.navigate('AccountDetail', {id: u.id})}
                user={u}
              />
            </Div>
          )}
        />
      ) : null}
    </>
  );
};

export default UserCardList;
