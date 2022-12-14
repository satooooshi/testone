import {useIsFocused, useNavigation} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
import {
  Alert,
  FlatList,
  RefreshControl,
  TouchableHighlight,
  TouchableOpacity,
} from 'react-native';
import {Div, Icon, Input, ScrollDiv, Text} from 'react-native-magnus';
import {ActivityIndicator} from 'react-native-paper';
import tailwind from 'tailwind-rn';
import RoomCard from '../../../components/chat/RoomCard';
import UserModal from '../../../components/common/UserModal';
import HeaderWithTextButton from '../../../components/Header';
import WholeContainer from '../../../components/WholeContainer';
import {useHandleBadge} from '../../../contexts/badge/useHandleBadge';
import {useAPISaveChatGroup} from '../../../hooks/api/chat/useAPISaveChatGroup';
import {useAPISavePin} from '../../../hooks/api/chat/useAPISavePin';
import {useAPIGetUsers} from '../../../hooks/api/user/useAPIGetUsers';
import {useUserRole} from '../../../hooks/user/useUserRole';
import {ChatGroup, RoomType} from '../../../types';
import {RoomListNavigationProps} from '../../../types/navigator/drawerScreenProps';
import {nameOfRoom} from '../../../utils/factory/chat/nameOfRoom';

const RoomList: React.FC = () => {
  const navigation = useNavigation<RoomListNavigationProps>();
  const [roomTypeSelector, setRoomTypeSelector] = useState(false);
  const [userModal, setVisibleUserModal] = useState(false);
  const {data: users, refetch: refetchGetUsers} = useAPIGetUsers('', {
    enabled: false,
  });
  const {
    chatGroups,
    setChatGroupsState,
    editChatGroup,
    isRoomsRefetching,
    isCompletedRefetchAllRooms,
    refreshRooms,
  } = useHandleBadge();
  const {selectedUserRole, filteredUsers} = useUserRole('All', users);
  const [creationType, setCreationType] = useState<RoomType>();
  const [searchedRooms, setSearchedRooms] = useState<ChatGroup[]>();
  const [chatRooms, setChatRooms] = useState<ChatGroup[]>(chatGroups);
  const isFocused = useIsFocused();

  const {mutate: createGroup} = useAPISaveChatGroup({
    onSuccess: createdData => {
      if (createdData.updatedAt === createdData.createdAt) {
        editChatGroup(createdData);
      }
      navigation.navigate('ChatStack', {
        screen: 'Chat',
        params: {room: createdData},
        initial: false,
      });
    },
    onError: () => {
      Alert.alert('???????????????????????????????????????????????????');
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
        rooms.splice(pinnedRoomsCount, 0, data);
        setChatGroupsState(rooms);
      }
      // refetchAllRooms();
    },
    onError: () => {
      Alert.alert(
        '????????????????????????????????????????????????????????????\n????????????????????????????????????????????????',
      );
    },
  });

  useEffect(() => {
    if (isFocused) {
      setChatRooms(chatGroups);
    }
  }, [chatGroups, isFocused]);

  // useEffect(() => {
  //   if (isCompletedRefetchAllRooms) {
  //     console.log('isCompletedRefetchAllRooms', chatGroups.length);
  //     setChatRooms(chatGroups);
  //   }
  // }, [chatGroups, isCompletedRefetchAllRooms]);

  useEffect(() => {
    if (roomTypeSelector) {
      refetchGetUsers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomTypeSelector]);

  const onPressRightButton = () => {
    // navigation.navigate('ChatStack', {screen: 'NewRoom'});
    setRoomTypeSelector(true);
  };

  const refreshRoomList = () => {
    refreshRooms();
  };

  return (
    <WholeContainer>
      <HeaderWithTextButton
        title="???????????????"
        rightButtonName={'????????????'}
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
              <Text>?????????</Text>
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
              <Text>????????????</Text>
            </>
          </TouchableHighlight>
          <UserModal
            isVisible={userModal}
            users={filteredUsers || []}
            onCloseModal={() => setVisibleUserModal(false)}
            selectedUserRole={selectedUserRole}
            defaultSelectedUsers={[]}
            onCompleteModal={(selectedUsers, reset) => {
              if (creationType === RoomType.TALK_ROOM) {
                createGroup({
                  members: selectedUsers,
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
            creationType={creationType}
          />
        </Div>
      ) : null}

      <Div alignItems="center">
        <Input
          w={'90%'}
          mb={5}
          placeholder="??????"
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
          clearButtonMode="while-editing"
        />
        {/* <Text>????????????{chatRooms.length}</Text> */}
        {chatRooms.length ? (
          <FlatList
            ListHeaderComponent={<Div h={10} />}
            ListFooterComponent={<Div h={130} />}
            refreshControl={
              <RefreshControl
                refreshing={!isCompletedRefetchAllRooms}
                onRefresh={refreshRoomList}
              />
            }
            data={searchedRooms ?? chatRooms}
            windowSize={30}
            renderItem={({item: room}) => (
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
            )}
          />
        ) : (
          <Text fontSize={16} textAlign="center">
            ????????????????????????????????????????????????????????????
          </Text>
        )}
      </Div>
    </WholeContainer>
  );
};

export default RoomList;
