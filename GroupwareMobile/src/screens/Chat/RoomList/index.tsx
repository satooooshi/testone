import {useNavigation} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
import {ActivityIndicator, FlatList} from 'react-native';
import {Div, Overlay} from 'react-native-magnus';
import RoomCard from '../../../components/chat/RoomCard';
import AppHeader from '../../../components/Header';
import WholeContainer from '../../../components/WholeContainer';
import {useAPIGetRooms} from '../../../hooks/api/chat/useAPIGetRoomsByPage';
import {roomListStyles} from '../../../styles/screen/chat/roomList.style';
import {ChatGroup} from '../../../types';
import {
  RoomListNavigationProps,
  RoomListRouteProps,
} from '../../../types/navigator/drawerScreenProps';

const RoomList: React.FC = () => {
  const navigation = useNavigation<RoomListNavigationProps>();
  const route = useNavigation<RoomListRouteProps>();
  const needRefetch = route.params?.needRefetch;
  const [page, setPage] = useState('1');
  const [roomsForInfiniteScroll, setRoomsForInfiniteScroll] = useState<
    ChatGroup[]
  >([]);
  const {
    data: chatRooms,
    isLoading: loadingGetChatGroupList,
    refetch,
  } = useAPIGetRooms({
    page,
  });

  const onPressRightButton = () => {
    navigation.navigate('ChatStack', {screen: 'NewRoom'});
  };

  const onEndReached = () => {
    setPage(p => (Number(p) + 1).toString());
  };

  useEffect(() => {
    if (needRefetch) {
      setRoomsForInfiniteScroll([]);
      refetch();
    }
  }, [refetch, needRefetch]);

  useEffect(() => {
    if (chatRooms?.rooms?.length) {
      setRoomsForInfiniteScroll(r => [...r, ...chatRooms.rooms]);
    }
  }, [chatRooms?.rooms]);

  return (
    <WholeContainer>
      <Overlay visible={loadingGetChatGroupList} p="xl">
        <ActivityIndicator />
      </Overlay>
      <AppHeader
        title="ルーム一覧"
        rightButtonName={'新規作成'}
        {...{onPressRightButton}}
      />
      <FlatList
        {...{onEndReached}}
        contentContainerStyle={roomListStyles.flatlistContent}
        data={roomsForInfiniteScroll}
        renderItem={({item: room}) => (
          <Div mb="lg">
            <RoomCard
              room={room}
              onPress={() =>
                navigation.navigate('ChatStack', {
                  screen: 'Chat',
                  params: {room},
                })
              }
            />
          </Div>
        )}
      />
    </WholeContainer>
  );
};

export default RoomList;
