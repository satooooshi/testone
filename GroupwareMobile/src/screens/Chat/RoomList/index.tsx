import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {AxiosError} from 'axios';
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
import {useAPIGetOneRoom} from '../../../hooks/api/chat/useAPIGetOneRoom';
import {useAPIGetRooms} from '../../../hooks/api/chat/useAPIGetRoomsByPage';
import {useAPISaveChatGroup} from '../../../hooks/api/chat/useAPISaveChatGroup';
import {useAPISavePin} from '../../../hooks/api/chat/useAPISavePin';
import {useAPIGetUsers} from '../../../hooks/api/user/useAPIGetUsers';
import {useUserRole} from '../../../hooks/user/useUserRole';
import {ChatGroup, RoomType} from '../../../types';
import {RoomListNavigationProps} from '../../../types/navigator/drawerScreenProps';
import {nameOfRoom} from '../../../utils/factory/chat/nameOfRoom';
import {storage} from '../../../utils/url';
import NetInfo, {useNetInfo} from '@react-native-community/netinfo';
import {DateTime} from 'luxon';

const RoomList: React.FC = () => {
  const navigation = useNavigation<RoomListNavigationProps>();
  const [page, setPage] = useState(1);
  const [latestPage, setLatestPage] = useState(1);
  const {setNewChatGroup} = useHandleBadge();
  const [roomTypeSelector, setRoomTypeSelector] = useState(false);
  const [userModal, setVisibleUserModal] = useState(false);
  const {data: users} = useAPIGetUsers('');
  const {chatGroups, setChatGroupsState} = useHandleBadge();
  const {selectedUserRole, filteredUsers} = useUserRole('All', users);
  const [creationType, setCreationType] = useState<RoomType>();
  const [searchedRooms, setSearchedRooms] = useState<ChatGroup[]>();
  const [chatRooms, setChatRooms] = useState<ChatGroup[]>(chatGroups);
  const [isNeedRefetch, setIsNeedRefetch] = useState<boolean>(false);
  const [isNeedRefetchLatest, setIsNeedRefetchLatest] =
    useState<boolean>(false);
  const [latestRooms, setLatestRooms] = useState<ChatGroup[]>([]);

  const {mutate: createGroup} = useAPISaveChatGroup({
    onSuccess: createdData => {
      if (createdData.updatedAt > createdData.createdAt) {
        setNewChatGroup(createdData);
      }
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
    onSuccess: data => {
      let rooms = chatGroups.filter(r => r.id !== data.id);
      if (data.isPinned) {
        const pinnedRoomsCount = rooms.filter(
          r => r.isPinned && r.updatedAt > data.updatedAt,
        ).length;
        rooms.splice(pinnedRoomsCount, 0, data);
        setChatGroupsState(rooms);
      } else {
        const pinnedRoomsCount = rooms.filter(
          r => r.isPinned || r.updatedAt > data.updatedAt,
        ).length;
        if (pinnedRoomsCount) {
          rooms.splice(pinnedRoomsCount, 0, data);
          setChatGroupsState(rooms);
        }
      }
      // refetchAllRooms();
    },
    onError: () => {
      Alert.alert(
        'ピン留めを更新中にエラーが発生しました。\n時間をおいて再実行してください。',
      );
    },
  });

  useFocusEffect(
    useCallback(() => {
      setChatRooms(chatGroups);
    }, [chatGroups]),
  );

  const onPressRightButton = () => {
    // navigation.navigate('ChatStack', {screen: 'NewRoom'});
    setRoomTypeSelector(true);
  };

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
            const filteredRooms = chatRooms.filter(r => {
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
          w={30}
          h={30}
          fontSize={10}
          onPress={() => {
            storage.delete('roomList');
            setPage(1);
          }}
        />

        {chatRooms.length && !isNeedRefetch ? (
          <ScrollDiv h={'80%'}>
            {searchedRooms
              ? searchedRooms.map(room => {
                  return (
                    <Div key={room.id} mb="sm">
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
              : chatRooms.map((room, index) => {
                  return (
                    <Div key={index} mb="sm">
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
