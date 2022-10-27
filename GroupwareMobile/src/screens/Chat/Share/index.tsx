import {useNavigation, useRoute} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
import {Alert} from 'react-native';
import {Button, Div, Icon, Input, ScrollDiv} from 'react-native-magnus';
import RoomCard from '../../../components/chat/RoomCard';
import HeaderWithTextButton from '../../../components/Header';
import WholeContainer from '../../../components/WholeContainer';
import {useHandleBadge} from '../../../contexts/badge/useHandleBadge';
import {useAPISendChatMessage} from '../../../hooks/api/chat/useAPISendChatMessage';
import {ChatGroup, ChatMessageType} from '../../../types';
import {nameOfRoom} from '../../../utils/factory/chat/nameOfRoom';

const Share: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>().params;
  const {urlPath, text} = route;
  const [selectedRoom, setSelectedRoom] = useState<ChatGroup[]>([]);
  const {chatGroups} = useHandleBadge();
  const [chatRooms, setChatRooms] = useState<ChatGroup[]>(chatGroups);
  const [searchedRooms, setSearchedRooms] = useState<ChatGroup[]>();

  const {mutate: sendChatMessage} = useAPISendChatMessage();

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

  useEffect(() => {
    setChatRooms(chatGroups);
  }, [chatGroups]);

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
        <ScrollDiv h={'80%'}>
          {searchedRooms
            ? searchedRooms.map(room => {
                return (
                  <Div key={room.id} mb="sm">
                    <RoomCard
                      room={room}
                      onPress={() => toggleRoom(room)}
                      dangerousBgColor={isSelected(room) ? 'gray300' : 'white'}
                    />
                  </Div>
                );
              })
            : chatRooms.map((room, index) => {
                return (
                  <Div key={index} mb="sm">
                    <RoomCard
                      room={room}
                      onPress={() => toggleRoom(room)}
                      dangerousBgColor={isSelected(room) ? 'gray300' : 'white'}
                    />
                  </Div>
                );
              })}
        </ScrollDiv>
      </Div>
    </WholeContainer>
  );
};

export default Share;
