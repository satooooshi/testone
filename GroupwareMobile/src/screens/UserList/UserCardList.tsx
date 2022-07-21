import {useIsFocused} from '@react-navigation/native';
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
  const isFocused = useIsFocused();
  const [searchQuery, setSearchQuery] = useState<SearchQueryToGetUsers>({});
  const {isLoading, refetch} = useAPISearchUsers(
    {
      ...searchQuery,
      role: userRole !== 'All' ? userRole : undefined,
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
          flatListRef?.current?.scrollToOffset({animated: false, offset: 0});
          return fetchedUser.users;
        });
      },
    },
  );
  const [usersForInfiniteScroll, setUsersForInfiniteScroll] = useState<User[]>(
    [],
  );
  const sortDropdownRef = useRef<any | null>(null);
  const durationDropdownRef = useRef<any | null>(null);
  const flatListRef = useRef<FlatList | null>(null);

  const onEndReached = () => {
    if (usersForInfiniteScroll.length >= Number(searchQuery.page) * 20) {
      setSearchQuery(q => ({...q, page: (Number(q?.page) + 1).toString()}));
    }
  };

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

  useEffect(() => {
    setSearchQuery(q => ({...q, word, tag, page: '1'}));
  }, [tag, word]);

  useEffect(() => {
    if (searchQuery.page) {
      refetch();
    }
  }, [searchQuery, refetch]);

  useEffect(() => {
    if (isFocused) {
      setSearchQuery({page: '1'});
    } else {
      setSearchQuery({});
    }
  }, [isFocused]);

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
            onPress={() =>
              setSearchQuery(q => ({...q, sort: undefined, page: '1'}))
            }>
            指定なし
          </Dropdown.Option>
          <Dropdown.Option
            {...defaultDropdownOptionProps}
            value={'none'}
            onPress={() =>
              setSearchQuery(q => ({...q, sort: 'event', page: '1'}))
            }>
            イベント参加数順
          </Dropdown.Option>
          <Dropdown.Option
            {...defaultDropdownOptionProps}
            value={'none'}
            onPress={() =>
              setSearchQuery(q => ({...q, sort: 'question', page: '1'}))
            }>
            質問数順
          </Dropdown.Option>
          <Dropdown.Option
            {...defaultDropdownOptionProps}
            value={'none'}
            onPress={() =>
              setSearchQuery(q => ({...q, sort: 'answer', page: '1'}))
            }>
            回答数順
          </Dropdown.Option>
          <Dropdown.Option
            {...defaultDropdownOptionProps}
            value={'none'}
            onPress={() =>
              setSearchQuery(q => ({...q, sort: 'knowledge', page: '1'}))
            }>
            ナレッジ投稿数順
          </Dropdown.Option>
        </Dropdown>
        <Dropdown ref={durationDropdownRef} {...defaultDropdownProps}>
          <Dropdown.Option
            {...defaultDropdownOptionProps}
            value={'none'}
            onPress={() =>
              setSearchQuery(q => ({...q, duration: undefined, page: '1'}))
            }>
            指定なし
          </Dropdown.Option>
          <Dropdown.Option
            {...defaultDropdownOptionProps}
            value={'none'}
            onPress={() =>
              setSearchQuery(q => ({...q, duration: 'week', page: '1'}))
            }>
            週間
          </Dropdown.Option>
          <Dropdown.Option
            {...defaultDropdownOptionProps}
            value={'none'}
            onPress={() =>
              setSearchQuery(q => ({...q, duration: 'month', page: '1'}))
            }>
            月間
          </Dropdown.Option>
        </Dropdown>
      </Div>
      {usersForInfiniteScroll?.length ? (
        <FlatList
          ref={flatListRef}
          data={usersForInfiniteScroll}
          onEndReached={onEndReached}
          onEndReachedThreshold={0.5}
          contentContainerStyle={userListStyles.flatlist}
          keyExtractor={item => item.id.toString()}
          renderItem={({item: u}) => (
            <Div mb={'lg'}>
              <UserCard filteredDuration={searchQuery.duration} user={u} />
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
