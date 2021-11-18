import React from 'react';
import {TouchableOpacity, useWindowDimensions} from 'react-native';
import {Div, Image, Text} from 'react-native-magnus';
import {roomCardStyles} from '../../../styles/component/chat/roomCard.style';
import {ChatGroup, User} from '../../../types';
import {darkFontColor} from '../../../utils/colors';
import {dateTimeFormatterFromJSDDate} from '../../../utils/dateTimeFormatterFromJSDate';

type RoomCardProps = {
  room: ChatGroup;
  onPress: () => void;
};

const RoomCard: React.FC<RoomCardProps> = ({room, onPress}) => {
  const {width: windowWidth} = useWindowDimensions();
  const nameOfEmptyNameGroup = (members?: User[]): string => {
    if (!members) {
      return 'メンバーがいません';
    }
    const strMembers = members?.map(m => m.lastName + m.firstName).toString();
    if (strMembers.length > 15) {
      return strMembers.slice(0, 15) + '...(' + members.length + ')';
    }
    return strMembers.toString();
  };

  return (
    <TouchableOpacity onPress={onPress}>
      <Div
        bg="white"
        w={windowWidth * 0.9}
        shadow="sm"
        p={4}
        h={100}
        alignItems="center"
        rounded="md"
        flexDir="row">
        <Image
          h={'90%'}
          source={
            room.imageURL
              ? {uri: room.imageURL}
              : require('../../../../assets/no-image-avatar.png')
          }
          rounded="circle"
          mr={'lg'}
          style={roomCardStyles.image}
        />
        <Div w={'75%'} pr={'sm'}>
          <Text numberOfLines={1} mb={'xs'} fontWeight="bold" fontSize={16}>
            {room.name || nameOfEmptyNameGroup(room.members)}
          </Text>
          <Text mb={'xs'} fontSize={14} color={darkFontColor}>
            TODO 最新メッセージを表示
          </Text>
          <Div flexDir="row" justifyContent="space-between">
            <Text>{`${room.members?.length || 0}人のメンバー`}</Text>
            <Text>
              {dateTimeFormatterFromJSDDate({
                dateTime: new Date(room.updatedAt),
              })}
            </Text>
          </Div>
        </Div>
      </Div>
    </TouchableOpacity>
  );
};

export default RoomCard;
