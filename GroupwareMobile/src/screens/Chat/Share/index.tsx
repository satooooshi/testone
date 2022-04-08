import {useNavigation, useRoute} from '@react-navigation/native';
import React, {useState} from 'react';
import {ActivityIndicator, Alert, FlatList} from 'react-native';
import {Button, Div, Icon} from 'react-native-magnus';
import tailwind from 'tailwind-rn';
import RoomCard from '../../../components/chat/RoomCard';
import HeaderWithTextButton from '../../../components/Header';
import WholeContainer from '../../../components/WholeContainer';
import {useAPIGetRooms} from '../../../hooks/api/chat/useAPIGetRoomsByPage';
import {useAPISavePin} from '../../../hooks/api/chat/useAPISavePin';
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
  const {data: chatRooms, isLoading: loadingGetChatGroupList} = useAPIGetRooms({
    page,
    limit: '20',
  });
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
  const [selectedRoom, setSelectedRoom] = useState<ChatGroup[]>([]);
  const {mutate: sendChatMessage} = useAPISendChatMessage();

  const onEndReached = () => {
    if (chatRooms?.rooms?.length) {
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
      <HeaderWithTextButton title="ルームを選択" enableBackButton={true} />
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
                savePin({...room, isPinned: !room.isPinned})
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
