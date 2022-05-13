import {useFocusEffect, useNavigation} from '@react-navigation/native';
import React, {useCallback, useEffect, useState} from 'react';
import {Alert, TouchableHighlight, TouchableOpacity} from 'react-native';
import {Button, Div, Icon, Input, ScrollDiv, Text} from 'react-native-magnus';
import {ActivityIndicator} from 'react-native-paper';
import tailwind from 'tailwind-rn';
import RoomCard from '../../../components/chat/RoomCard';
import UserModal from '../../../components/common/UserModal';
import HeaderWithTextButton from '../../../components/Header';
import WholeContainer from '../../../components/WholeContainer';
import {useHandleBadge} from '../../../contexts/badge/useHandleBadge';
import {useAPIGetRooms} from '../../../hooks/api/chat/useAPIGetRoomsByPage';
import {useAPISaveChatGroup} from '../../../hooks/api/chat/useAPISaveChatGroup';
import {useAPISavePin} from '../../../hooks/api/chat/useAPISavePin';
import {useAPIGetUsers} from '../../../hooks/api/user/useAPIGetUsers';
import {useUserRole} from '../../../hooks/user/useUserRole';
import {ChatGroup, RoomType} from '../../../types';
import {RoomListNavigationProps} from '../../../types/navigator/drawerScreenProps';
import {nameOfRoom} from '../../../utils/factory/chat/nameOfRoom';
import storage from '../../../utils/storage';

const RoomList: React.FC = () => {
  const navigation = useNavigation<RoomListNavigationProps>();
  const [page, setPage] = useState(1);
  const [roomsForInfiniteScroll, setRoomsForInfiniteScroll] = useState<
    ChatGroup[]
  >([]);
  const [roomTypeSelector, setRoomTypeSelector] = useState(false);
  const [userModal, setVisibleUserModal] = useState(false);
  const {data: users} = useAPIGetUsers('');
  const {unreadChatCount} = useHandleBadge();
  const {selectedUserRole, filteredUsers} = useUserRole('All', users);
  const [creationType, setCreationType] = useState<RoomType>();

  const [searchedRooms, setSearchedRooms] = useState<ChatGroup[]>();
  const [isNeedRefetch, setIsNeedRefetch] = useState<boolean>(false);
  const {refetch: refetchAllRooms, isLoading: loadingGetChatGroupList} =
    useAPIGetRooms(
      {
        page: page.toString(),
        limit: '20',
      },
      {
        enabled: false,
        onSuccess: data => {
          console.log('call -----------------------', data.rooms.length);
          setPage(p => p + 1);
          if (data.rooms.length) {
            setIsNeedRefetch(true);
            setRoomsForInfiniteScroll(r =>
              r.length ? [...r, ...data.rooms] : [...data.rooms],
            );
          } else {
            setIsNeedRefetch(false);
            setPage(1);
          }
        },
      },
    );

  const {mutate: createGroup} = useAPISaveChatGroup({
    onSuccess: createdData => {
      refetchAllRooms();
      navigation.navigate('ChatStack', {
        screen: 'Chat',
        params: {room: createdData},
        initial: false,
      });
    },
    onError: () => {
      Alert.alert('チャットルームの作成に失敗しました');
    },
  });

  const {mutate: savePin} = useAPISavePin({
    onSuccess: () => {
      refetchAllRooms();
    },
    onError: () => {
      Alert.alert(
        'ピン留めを更新中にエラーが発生しました。\n時間をおいて再実行してください。',
      );
    },
  });

  const onPressRightButton = () => {
    // navigation.navigate('ChatStack', {screen: 'NewRoom'});
    setRoomTypeSelector(true);
  };

  useEffect(() => {
    refetchAllRooms();
  }, [unreadChatCount, refetchAllRooms]);

  useFocusEffect(
    useCallback(() => {
      storage
        .load({
          key: 'roomList',
        })
        .then(loadedData => {
          if (loadedData.length) {
            setRoomsForInfiniteScroll(loadedData);
          } else {
            refetchAllRooms();
          }
        });
    }, []),
  );

  useEffect(() => {
    if (roomsForInfiniteScroll.length) {
      storage.save({
        key: 'roomList',
        data: roomsForInfiniteScroll,
      });
    }
    if (isNeedRefetch) {
      refetchAllRooms();
    }
  }, [roomsForInfiniteScroll, isNeedRefetch, refetchAllRooms]);

  return (
    <WholeContainer>
      <HeaderWithTextButton
        title="ルーム一覧"
        rightButtonName={'新規作成'}
        {...{onPressRightButton}}
      />

      {roomTypeSelector ? (
        <Div
          bg="white"
          flexDir="row"
          alignSelf="center"
          w={'100%'}
          pt={24}
          py={'lg'}
          justifyContent="space-around"
          px={'sm'}>
          <TouchableOpacity
            style={tailwind('absolute top-1 right-1')}
            onPress={() => {
              setRoomTypeSelector(false);
            }}>
            <Icon color="black" name="close" fontSize={20} />
          </TouchableOpacity>

          <TouchableHighlight
            underlayColor="none"
            onPress={() => {
              setVisibleUserModal(true);
              setCreationType(RoomType.TALK_ROOM);
            }}
            style={tailwind('justify-center w-6/12 items-center')}>
            <>
              <Icon
                fontFamily="Ionicons"
                name="chatbubble-ellipses-outline"
                color={'black'}
                fontSize={36}
              />
              <Text>トーク</Text>
            </>
          </TouchableHighlight>
          <TouchableHighlight
            underlayColor="none"
            style={tailwind('justify-center w-6/12 items-center')}
            onPress={() => {
              setVisibleUserModal(true);
              setCreationType(RoomType.GROUP);
            }}>
            <>
              <Icon
                fontFamily="Ionicons"
                name="ios-chatbubbles-outline"
                color={'black'}
                fontSize={36}
              />
              <Text>グループ</Text>
            </>
          </TouchableHighlight>
          <UserModal
            isVisible={userModal}
            users={filteredUsers || []}
            onCloseModal={() => setVisibleUserModal(false)}
            selectedUserRole={selectedUserRole}
            defaultSelectedUsers={[]}
            onCompleteModal={(selectedUsers, reset) => {
              if (
                selectedUsers.length === 1 &&
                creationType === RoomType.TALK_ROOM
              ) {
                createGroup({
                  members: selectedUsers,
                  roomType: RoomType.PERSONAL,
                });
                setRoomTypeSelector(false);
                return;
              }
              setRoomTypeSelector(false);
              navigation.navigate('ChatStack', {
                screen: 'NewRoom',
                params: {selectedMembers: selectedUsers},
              });
              reset();
              setRoomTypeSelector(false);
            }}
          />
        </Div>
      ) : null}

      <Div alignItems="center">
        <Input
          w={'90%'}
          mb={20}
          placeholder="検索"
          onChangeText={e => {
            const filteredRooms = roomsForInfiniteScroll.filter(r => {
              const regex = new RegExp(e);
              return r.name ? regex.test(r.name) : regex.test(nameOfRoom(r));
            });
            setSearchedRooms(filteredRooms);
          }}
          prefix={
            <Icon
              name="search"
              color="gray900"
              fontFamily="Feather"
              fontSize={12}
            />
          }
        />
        <Button
          fontSize={10}
          onPress={() => {
            storage.remove({key: 'roomList'});
            setRoomsForInfiniteScroll([]);
            setPage(1);
          }}
        />

        {roomsForInfiniteScroll.length && !isNeedRefetch ? (
          <ScrollDiv h={'80%'}>
            {searchedRooms
              ? searchedRooms.map(room => {
                  return (
                    <Div mb="sm">
                      <RoomCard
                        room={room}
                        onPress={() =>
                          navigation.navigate('ChatStack', {
                            screen: 'Chat',
                            params: {room},
                          })
                        }
                        onPressPinButton={() => {
                          savePin({...room, isPinned: !room.isPinned});
                        }}
                      />
                    </Div>
                  );
                })
              : roomsForInfiniteScroll.map(room => {
                  return (
                    <Div mb="sm">
                      <RoomCard
                        room={room}
                        onPress={() =>
                          navigation.navigate('ChatStack', {
                            screen: 'Chat',
                            params: {room},
                          })
                        }
                        onPressPinButton={() => {
                          savePin({...room, isPinned: !room.isPinned});
                        }}
                      />
                    </Div>
                  );
                })}
          </ScrollDiv>
        ) : isNeedRefetch ? (
          <Div alignItems="center" w={'90%'}>
            <Text>
              ただいま全てのルームを取得しています。{'\n'}
              しばらくの間お待ちください。
            </Text>
            <ActivityIndicator />
          </Div>
        ) : (
          <Text fontSize={16} textAlign="center">
            ルームを作成するか、招待をお待ちください
          </Text>
        )}
      </Div>
    </WholeContainer>
  );
};

export default RoomList;
