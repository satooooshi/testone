import {useFocusEffect, useNavigation} from '@react-navigation/native';
import React, {useCallback, useState} from 'react';
import {Alert, FlatList} from 'react-native';
import {Div, Text} from 'react-native-magnus';
import {ActivityIndicator} from 'react-native-paper';
import tailwind from 'tailwind-rn';
import RoomCard from '../../../components/chat/RoomCard';
import HeaderWithTextButton from '../../../components/Header';
import WholeContainer from '../../../components/WholeContainer';
import {useAPIGetRooms} from '../../../hooks/api/chat/useAPIGetRoomsByPage';
import {useAPIUpdateChatGroup} from '../../../hooks/api/chat/useAPIUpdateChatGroup';
import {ChatGroup} from '../../../types';
import {RoomListNavigationProps} from '../../../types/navigator/drawerScreenProps';

const RoomList: React.FC = () => {
  const navigation = useNavigation<RoomListNavigationProps>();
  const [page, setPage] = useState('1');
  const [roomsForInfiniteScroll, setRoomsForInfiniteScroll] = useState<
    ChatGroup[]
  >([]);

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
  });
  const {mutate: saveGroup} = useAPIUpdateChatGroup({
    onSuccess: () => {
      refetchAllRooms();
    },
    onError: () => {
      Alert.alert(
        'チャットルーム更新中にエラーが発生しました。\n時間をおいて再実行してください。',
      );
    },
  });

  const onPressRightButton = () => {
    navigation.navigate('ChatStack', {screen: 'NewRoom'});
  };

  const onEndReached = () => {
    if (
      typeof Number(chatRooms?.pageCount) === 'number' &&
      Number(page + 1) <= Number(chatRooms?.pageCount)
    ) {
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
      {loadingGetChatGroupList ? <ActivityIndicator /> : null}
      {!loadingGetChatGroupList && roomsForInfiniteScroll.length ? (
        <FlatList
          {...{onEndReached}}
          contentContainerStyle={tailwind('self-center mt-4')}
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
                  saveGroup({...room, isPinned: !room.isPinned});
                }}
              />
            </Div>
          )}
        />
      ) : !loadingGetChatGroupList ? (
        <Text fontSize={16} textAlign="center">
          ルームを作成するか、招待をお待ちください
        </Text>
      ) : null}
    </WholeContainer>
  );
};

export default RoomList;
