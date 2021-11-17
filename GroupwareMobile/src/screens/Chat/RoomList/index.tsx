import React from 'react';
import {FlatList} from 'react-native';
import {Div} from 'react-native-magnus';
import RoomCard from '../../../components/chat/RoomCard';
import AppHeader from '../../../components/Header';
import WholeContainer from '../../../components/WholeContainer';
import {useAPIGetChatGroupList} from '../../../hooks/api/chat/useAPIGetChatGroupList';
import {roomListStyles} from '../../../styles/screen/chat/roomList.style';
import {RoomListProps} from '../../../types/navigator/screenProps/Chat';

const RoomList: React.FC<RoomListProps> = ({navigation}) => {
  const {data: chatRooms} = useAPIGetChatGroupList();

  const onPressRightButton = () => {
    navigation.navigate('NewRoom');
  };

  return (
    <WholeContainer>
      <AppHeader
        title="ルーム一覧"
        rightButtonName={'新規作成'}
        {...{onPressRightButton}}
      />
      <FlatList
        contentContainerStyle={roomListStyles.flatlistContent}
        data={chatRooms}
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
