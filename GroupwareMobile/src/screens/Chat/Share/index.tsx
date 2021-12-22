import {useNavigation, useRoute} from '@react-navigation/native';
import React, {useCallback, useState} from 'react';
import {ActivityIndicator, Alert, FlatList} from 'react-native';
import {Button, Div, Icon} from 'react-native-magnus';
import tailwind from 'tailwind-rn';
import RoomCard from '../../../components/chat/RoomCard';
import HeaderWithTextButton from '../../../components/Header';
import WholeContainer from '../../../components/WholeContainer';
import {useAPIGetRooms} from '../../../hooks/api/chat/useAPIGetRoomsByPage';
import {useAPISaveChatGroup} from '../../../hooks/api/chat/useAPISaveChatGroup';
import {useAPISendChatMessage} from '../../../hooks/api/chat/useAPISendChatMessage';
import {ChatGroup, ChatMessageType} from '../../../types';

const Share: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>().params;
  const {urlPath, text} = route;
  const [page, setPage] = useState('1');
  const [roomsForInfiniteScroll, setRoomsForInfiniteScroll] = useState<
    ChatGroup[]
  >([]);
  useAPIGetRooms(
    {
      page: '1',
      limit: (20 * Number(page)).toString(),
    },
    {
      refetchInterval: 3000,
      onSuccess: data => {
        stateRefreshNeeded(data.rooms);
      },
      onError: () => {
        Alert.alert(
          'ルーム取得中にエラーが発生しました。\n時間をおいて再実行してください。',
        );
      },
    },
  );
  const [selectedRoom, setSelectedRoom] = useState<ChatGroup[]>([]);
  const {mutate: sendChatMessage} = useAPISendChatMessage();

  const {
    data: chatRooms,
    isLoading: loadingGetChatGroupList,
    refetch,
  } = useAPIGetRooms({
    page,
  });
  const {mutate: saveGroup} = useAPISaveChatGroup({
    onSuccess: () => {
      handleRefetch();
    },
    onError: () => {
      Alert.alert(
        'チャット更新中にエラーが発生しました。\n時間をおいて再実行してください。',
      );
    },
  });

  const handleRefetch = useCallback(() => {
    setRoomsForInfiniteScroll([]);
    refetch();
  }, [refetch]);

  const onEndReached = () => {
    if (
      typeof Number(chatRooms?.pageCount) === 'number' &&
      Number(page + 1) <= Number(chatRooms?.pageCount)
    ) {
      setPage(p => (Number(p) + 1).toString());
    }
  };

  const toggleRoom = (targetRoom: ChatGroup) => {
    const isExist = selectedRoom?.filter(t => t.id === targetRoom.id).length;
    if (isExist) {
      const newSelectedRooms = selectedRoom
        ? selectedRoom.filter(t => t.id !== targetRoom.id)
        : [];
      setSelectedRoom(newSelectedRooms);
      return;
    }
    const newSelectedRooms = selectedRoom
      ? [...selectedRoom, targetRoom]
      : [targetRoom];
    setSelectedRoom(newSelectedRooms);
  };

  const isSelected = (targetRoom: ChatGroup): boolean => {
    return !!selectedRoom.filter(r => r.id === targetRoom.id).length;
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
          roomsForInfiniteScroll[i].hasBeenRead !== newData?.[i]?.hasBeenRead
        ) {
          updateNeeded = true;
        }
      }
    }
    if (updateNeeded) {
      setRoomsForInfiniteScroll(newData);
    }
  };

  const handleSubmit = () => {
    selectedRoom.map((r, index) => {
      sendChatMessage(
        {
          content: `${urlPath}\n${text}`,
          type: ChatMessageType.TEXT,
          chatGroup: r,
        },
        {
          onSuccess: () => {
            if (index === selectedRoom.length - 1) {
              Alert.alert('共有メッセージを送信しました', undefined, [
                {
                  text: 'OK',
                  onPress: () => navigation.goBack(),
                },
              ]);
            }
          },
          onError: () => {
            Alert.alert(
              '送信中にエラーが発生しました。\n時間をおいて再実行してください。',
            );
          },
        },
      );
    });
  };

  return (
    <WholeContainer>
      <HeaderWithTextButton title="ルーム一覧" />
      <Button
        onPress={handleSubmit}
        bg="purple600"
        position="absolute"
        right={10}
        bottom={10}
        h={60}
        zIndex={20}
        rounded="circle"
        w={60}>
        <Icon color="white" fontFamily="Ionicons" fontSize="6xl" name="send" />
      </Button>
      <FlatList
        {...{onEndReached}}
        contentContainerStyle={tailwind('self-center mt-4')}
        keyExtractor={item => item.id.toString()}
        data={roomsForInfiniteScroll}
        renderItem={({item: room}) => (
          <Div mb="sm">
            <RoomCard
              room={room}
              onPress={() => toggleRoom(room)}
              dangerousBgColor={isSelected(room) ? 'gray300' : 'white'}
              onPressPinButton={() =>
                saveGroup({...room, isPinned: !room.isPinned})
              }
            />
          </Div>
        )}
      />
      {loadingGetChatGroupList && <ActivityIndicator />}
    </WholeContainer>
  );
};

export default Share;
