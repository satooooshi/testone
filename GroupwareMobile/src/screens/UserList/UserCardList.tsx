import {useNavigation} from '@react-navigation/native';
import React, {useEffect, useRef, useState} from 'react';
import {FlatList} from 'react-native';
import {Div, Dropdown, Text} from 'react-native-magnus';
import {ActivityIndicator} from 'react-native-paper';
import DropdownOpenerButton from '../../components/common/DropdownOpenerButton';
import UserCard from '../../components/users/UserCard';
import {
  SearchQueryToGetUsers,
  useAPISearchUsers,
} from '../../hooks/api/user/useAPISearchUsers';
import {userListStyles} from '../../styles/screen/user/userList.style';
import {User, UserRoleInApp} from '../../types';
import {UsersListNavigationProps} from '../../types/navigator/drawerScreenProps';
import {
  defaultDropdownProps,
  defaultDropdownOptionProps,
} from '../../utils/dropdown/helper';

type UserCardListProps = {
  userRole: UserRoleInApp;
  word: string;
  tag: string;
};

const UserCardList: React.FC<UserCardListProps> = ({userRole, word, tag}) => {
  const [searchQuery, setSearchQuery] = useState<SearchQueryToGetUsers>({
    page: '1',
  });
  const {data: users, isLoading} = useAPISearchUsers({
    ...searchQuery,
    role: userRole !== 'All' ? userRole : undefined,
    page: searchQuery?.page || '1',
    word,
    tag,
  });
  const [usersForInfiniteScroll, setUsersForInfiniteScroll] = useState<User[]>(
    [],
  );
  const navigation = useNavigation<UsersListNavigationProps>();
  const sortDropdownRef = useRef<any | null>(null);
  const durationDropdownRef = useRef<any | null>(null);

  const onEndReached = () => {
    setSearchQuery(q => ({...q, page: (Number(q?.page) + 1).toString()}));
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
      {usersForInfiniteScroll?.length ? (
        <FlatList
          data={usersForInfiniteScroll}
          onEndReached={onEndReached}
          contentContainerStyle={userListStyles.flatlist}
          keyExtractor={item => item.id.toString()}
          renderItem={({item: u}) => (
            <Div mb={'lg'}>
              <UserCard
                filteredDuration={searchQuery.duration}
                onPress={() =>
                  navigation.navigate('AccountStack', {
                    screen: 'AccountDetail',
                    params: {id: u.id},
                  })
                }
                onPressTag={t =>
                  setSearchQuery(q => ({...q, tag: t.id.toString()}))
                }
                user={u}
              />
            </Div>
          )}
        />
      ) : (
        <Div alignSelf="center">
          <Text fontSize={16}>検索結果が見つかりませんでした</Text>
        </Div>
      )}
      {isLoading && <ActivityIndicator />}
    </>
  );
};

export default UserCardList;
