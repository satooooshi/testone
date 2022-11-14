import React, {useRef} from 'react';
import {Platform, TouchableHighlight, useWindowDimensions} from 'react-native';
import FastImage from 'react-native-fast-image';
import {Swipeable} from 'react-native-gesture-handler';
import {Button, Div, Icon, Text} from 'react-native-magnus';
import tailwind from 'tailwind-rn';
import {useAuthenticate} from '../../../contexts/useAuthenticate';
import {roomCardStyles} from '../../../styles/component/chat/roomCard.style';
import {ChatGroup, ChatMessage, ChatMessageType} from '../../../types';
import {darkFontColor} from '../../../utils/colors';
import {dateTimeFormatterFromJSDDate} from '../../../utils/dateTimeFormatterFromJSDate';
import {nameOfRoom} from '../../../utils/factory/chat/nameOfRoom';
import {mentionTransform} from '../../../utils/messageTransform';
import {Badge} from 'react-native-paper';

type RoomCardProps = {
  room: ChatGroup;
  onPress: () => void;
  onPressPinButton?: () => void;
  //this param overrides every background color
  dangerousBgColor?: string;
};

const RoomCard: React.FC<RoomCardProps> = ({
  room,
  onPress,
  onPressPinButton,
  dangerousBgColor,
}) => {
  const ref = useRef<Swipeable>(null);
  const {width: windowWidth} = useWindowDimensions();
  const {user} = useAuthenticate();

  const rightSwipeActions = () => {
    return (
      <Button
        bg="green500"
        h={'100%'}
        w={80}
        onPress={() => {
          if (onPressPinButton) {
            onPressPinButton();
          }
          ref?.current?.close();
        }}>
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

  const latestCall = (message: ChatMessage) => {
    switch (message.content) {
      case '音声通話':
        return `通話時間 ${message.callTime}`;
      case 'キャンセル':
        return message.sender?.id === user?.id
          ? '通話をキャンセルしました'
          : '不在着信';
      case '応答なし':
        return message.sender?.id === user?.id
          ? '通話に応答がありませんでした'
          : '不在着信';
      default:
        return 'error';
    }
  };
  const latestMessage = (chatMessage: ChatMessage) => {
    switch (chatMessage.type) {
      case ChatMessageType.IMAGE:
        return '画像が送信されました';
      case ChatMessageType.VIDEO:
        return '動画が送信されました';
      case ChatMessageType.STICKER:
        return 'スタンプが送信されました';
      case ChatMessageType.OTHER_FILE:
        return 'ファイルが送信されました';
      case ChatMessageType.CALL:
        return latestCall(chatMessage);
      default:
        return mentionTransform(chatMessage.content);
    }
  };

  return (
    <TouchableHighlight
      underlayColor="none"
      onPress={() => {
        onPress();
      }}>
      <Swipeable
        ref={ref}
        enabled={onPressPinButton ? true : false}
        containerStyle={tailwind('rounded-sm')}
        renderRightActions={rightSwipeActions}>
        <Div
          bg={dangerousBgColor ? dangerousBgColor : 'white'}
          w={windowWidth * 0.9}
          p="md"
          h={70}
          alignItems="center"
          rounded="lg"
          flexDir="row">
          <Div mr="xs">
            <FastImage
              source={
                room.imageURL
                  ? {uri: room.imageURL}
                  : require('../../../../assets/no-image-avatar.png')
              }
              style={roomCardStyles.image}
            />
            {room.isPinned ? (
              <Icon
                name={room.isPinned ? 'pin' : 'pin-outline'}
                fontSize={20}
                color="blue600"
                p={2}
                bg="blue100"
                rounded="circle"
                fontFamily="MaterialCommunityIcons"
                style={Platform.OS === 'android' && roomCardStyles.pinIcon}
                position="absolute"
              />
            ) : null}
          </Div>
          <Div flex={1}>
            <Div
              flexDir="row"
              mb={'xs'}
              justifyContent="space-between"
              alignItems="center">
              <Div flex={1}>
                <Text numberOfLines={1} fontWeight="bold" fontSize={16}>
                  {nameOfRoom(room, user)}
                </Text>
                {room.muteUsers &&
                room.muteUsers.filter(u => u.id === user?.id).length ? (
                  <Icon
                    ml={3}
                    name="volume-mute-outline"
                    fontFamily="Ionicons"
                    fontSize={16}
                  />
                ) : null}
              </Div>
              <Text fontSize={11}>
                {dateTimeFormatterFromJSDDate({
                  dateTime: new Date(
                    room?.chatMessages?.[0]?.createdAt
                      ? room?.chatMessages?.[0]?.createdAt
                      : room.createdAt,
                  ),
                })}
              </Text>
            </Div>
            <Text fontSize={11}>{`${room.memberCount}人のメンバー`}</Text>
            <Div
              mt={4}
              flexDir="row"
              justifyContent="space-between"
              alignItems="center">
              <Div flex={1} pr={1}>
                <Text
                  fontSize={14}
                  letterSpacing={0.5}
                  color="gray500"
                  numberOfLines={1}>
                  {room.chatMessages?.length
                    ? latestMessage(room.chatMessages[0])
                    : ''}
                </Text>
              </Div>
              <Div>
                {room?.unreadCount && room?.unreadCount > 0 ? (
                  <Badge
                    // eslint-disable-next-line react-native/no-inline-styles
                    style={{
                      marginLeft: 2,
                      backgroundColor: 'red',
                      fontWeight: 'bold',
                      fontSize: 14,
                    }}
                    size={18}>
                    {`${room?.unreadCount}`}
                  </Badge>
                ) : null}
              </Div>
            </Div>
          </Div>
        </Div>
      </Swipeable>
    </TouchableHighlight>
  );
};

export default RoomCard;
