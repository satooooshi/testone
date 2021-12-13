import React from 'react';
import {Platform, TouchableOpacity, useWindowDimensions} from 'react-native';
import FastImage from 'react-native-fast-image';
import {Swipeable} from 'react-native-gesture-handler';
import {Button, Div, Icon, Image, Text} from 'react-native-magnus';
import tailwind from 'tailwind-rn';
import {roomCardStyles} from '../../../styles/component/chat/roomCard.style';
import {ChatGroup, ChatMessage, ChatMessageType, User} from '../../../types';
import {darkFontColor} from '../../../utils/colors';
import {dateTimeFormatterFromJSDDate} from '../../../utils/dateTimeFormatterFromJSDate';

type RoomCardProps = {
  room: ChatGroup;
  onPress: () => void;
  onPressPinButton: () => void;
};

const RoomCard: React.FC<RoomCardProps> = ({
  room,
  onPress,
  onPressPinButton,
}) => {
  const {width: windowWidth} = useWindowDimensions();
  const nameOfEmptyNameGroup = (members?: User[]): string => {
    if (!members?.length) {
      return 'メンバーがいません';
    }
    const strMembers = members?.map(m => m.lastName + m.firstName).join();
    return strMembers;
  };
  const rightSwipeActions = () => {
    return (
      <Button bg="green500" h={'100%'} w={80} onPress={onPressPinButton}>
        <Icon
          name={!room.isPinned ? 'pin' : 'pin-off'}
          fontSize={24}
          bg="green500"
          color="white"
          fontFamily="MaterialCommunityIcons"
        />
      </Button>
    );
  };
  const latestMessage = (chatMessage: ChatMessage) => {
    switch (chatMessage.type) {
      case ChatMessageType.IMAGE:
        return '画像が送信されました';
      case ChatMessageType.VIDEO:
        return '動画が送信されました';
      case ChatMessageType.OTHER_FILE:
        return 'ファイルが送信されました';
      default:
        return chatMessage.content;
    }
  };

  return (
    <TouchableOpacity onPress={onPress}>
      <Swipeable
        containerStyle={tailwind('rounded-sm')}
        renderRightActions={rightSwipeActions}>
        <Div
          bg="white"
          w={windowWidth * 0.9}
          shadow="sm"
          p={4}
          h={100}
          alignItems="center"
          flexDir="row">
          <Div>
            <FastImage
              source={
                room.imageURL
                  ? {uri: room.imageURL}
                  : require('../../../../assets/no-image-avatar.png')
              }
              style={roomCardStyles.image}
            />
            {room.isPinned && (
              <Icon
                name="pin"
                fontSize={26}
                color="green500"
                bg="white"
                rounded="circle"
                borderWidth={1}
                borderColor={'green500'}
                fontFamily="MaterialCommunityIcons"
                style={Platform.OS === 'android' && roomCardStyles.pinIcon}
                position="absolute"
                bottom={0}
                right={10}
              />
            )}
          </Div>
          <Div w={'75%'} pr={'sm'}>
            <Text numberOfLines={1} mb={'xs'} fontWeight="bold" fontSize={16}>
              {room.name || nameOfEmptyNameGroup(room.members)}
            </Text>
            <Text
              mb={'xs'}
              fontSize={14}
              color={darkFontColor}
              numberOfLines={1}>
              {room.chatMessages?.length
                ? latestMessage(room.chatMessages[0])
                : ''}
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
      </Swipeable>
    </TouchableOpacity>
  );
};

export default RoomCard;
