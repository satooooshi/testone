import {useIsFocused} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
import {ActivityIndicator, FlatList} from 'react-native';
import {Div, Overlay} from 'react-native-magnus';
import RoomCard from '../../../components/chat/RoomCard';
import AppHeader from '../../../components/Header';
import WholeContainer from '../../../components/WholeContainer';
import {useAPIGetRooms} from '../../../hooks/api/chat/useAPIGetRoomsByPage';
import {roomListStyles} from '../../../styles/screen/chat/roomList.style';
import {ChatGroup} from '../../../types';
import {RoomListProps} from '../../../types/navigator/screenProps/Chat';

const RoomList: React.FC<RoomListProps> = ({navigation}) => {
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
  const isFocused = useIsFocused();

  const onPressRightButton = () => {
    navigation.navigate('NewRoom');
  };

  const onEndReached = () => {
    setPage(p => (Number(p) + 1).toString());
  };

  useEffect(() => {
    if (isFocused) {
      setRoomsForInfiniteScroll([]);
      refetch();
    }
  }, [isFocused, refetch]);

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
              onPress={() => navigation.navigate('Chat', {room})}
            />
          </Div>
        )}
      />
    </WholeContainer>
  );
};

export default RoomList;
