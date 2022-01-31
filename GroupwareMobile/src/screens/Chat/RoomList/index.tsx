import {useFocusEffect, useNavigation} from '@react-navigation/native';
import React, {useCallback, useState} from 'react';
import {
  Alert,
  FlatList,
  TouchableHighlight,
  TouchableOpacity,
} from 'react-native';
import {Div, Icon, Text} from 'react-native-magnus';
import {ActivityIndicator} from 'react-native-paper';
import tailwind from 'tailwind-rn';
import RoomCard from '../../../components/chat/RoomCard';
import UserModal from '../../../components/common/UserModal';
import HeaderWithTextButton from '../../../components/Header';
import WholeContainer from '../../../components/WholeContainer';
import {useAPIGetRooms} from '../../../hooks/api/chat/useAPIGetRoomsByPage';
import {useAPISaveChatGroup} from '../../../hooks/api/chat/useAPISaveChatGroup';
import {useAPISavePin} from '../../../hooks/api/chat/useAPISavePin';
import {useAPIGetUsers} from '../../../hooks/api/user/useAPIGetUsers';
import {useUserRole} from '../../../hooks/user/useUserRole';
import {ChatGroup} from '../../../types';
import {RoomListNavigationProps} from '../../../types/navigator/drawerScreenProps';

const RoomList: React.FC = () => {
  const navigation = useNavigation<RoomListNavigationProps>();
  const [page, setPage] = useState('1');
  const [roomsForInfiniteScroll, setRoomsForInfiniteScroll] = useState<
    ChatGroup[]
  >([]);
  const [roomTypeSelector, setRoomTypeSelector] = useState(false);
  const [userModal, setVisibleUserModal] = useState(false);
  const {data: users} = useAPIGetUsers();
  const {selectedUserRole, filteredUsers} = useUserRole('All', users);
  const [creationType, setCreationType] = useState<
    'talk' | 'group' | undefined
  >();

  const {refetch: refetchAllRooms} = useAPIGetRooms(
    {
      page: '1',
      limit: (20 * Number(page)).toString(),
    },
    {
      refetchInterval: 30000,
      onSuccess: data => {
        stateRefreshNeeded(data.rooms);
      },
    },
  );

  const {data: chatRooms, isLoading: loadingGetChatGroupList} = useAPIGetRooms({
    page,
    limit: '20',
  });
  const {mutate: createGroup} = useAPISaveChatGroup({
    onSuccess: createdData => {
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

  const onEndReached = () => {
    if (chatRooms?.rooms?.length) {
      setPage(p => (Number(p) + 1).toString());
    }
  };

  const stateRefreshNeeded = (newData: ChatGroup[]) => {
    let updateNeeded = false;
    if (roomsForInfiniteScroll.length !== newData?.length) {
      updateNeeded = true;
    }
    if (roomsForInfiniteScroll.length || newData?.length) {
      for (let i = 0; i < roomsForInfiniteScroll.length; i++) {
        if (updateNeeded) {
          break;
        }
        if (
          new Date(roomsForInfiniteScroll[i]?.updatedAt).getTime() !==
            new Date(newData?.[i]?.updatedAt).getTime() ||
          roomsForInfiniteScroll[i].hasBeenRead !== newData?.[i]?.hasBeenRead ||
          roomsForInfiniteScroll[i]?.members?.length !==
            newData?.[i]?.members?.length
        ) {
          updateNeeded = true;
        }
      }
    }
    if (updateNeeded) {
      setRoomsForInfiniteScroll(newData);
    }
  };

  useFocusEffect(
    useCallback(() => {
      refetchAllRooms();
    }, [refetchAllRooms]),
  );

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
              setCreationType('talk');
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
              setCreationType('group');
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
              if (selectedUsers.length === 1 && creationType === 'talk') {
                createGroup({members: selectedUsers});
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
      {roomsForInfiniteScroll.length ? (
        <FlatList
          {...{onEndReached}}
          ListFooterComponent={
            loadingGetChatGroupList ? <ActivityIndicator /> : null
          }
          contentContainerStyle={tailwind('self-center mt-4 pb-4')}
          keyExtractor={item => item.id.toString()}
          data={roomsForInfiniteScroll}
          renderItem={({item: room}) => (
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
          )}
        />
      ) : loadingGetChatGroupList ? (
        <ActivityIndicator />
      ) : (
        <Text fontSize={16} textAlign="center">
          ルームを作成するか、招待をお待ちください
        </Text>
      )}
    </WholeContainer>
  );
};

export default RoomList;
