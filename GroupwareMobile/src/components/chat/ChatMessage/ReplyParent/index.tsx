import React from 'react';
import {Div, Image, Text} from 'react-native-magnus';
import {ChatMessage, ChatMessageType} from '../../../../types';
import {userNameFactory} from '../../../../utils/factory/userNameFactory';

type ReplyParentProps = {
  parentMessage: ChatMessage;
};

const ReplyParent: React.FC<ReplyParentProps> = ({parentMessage}) => {
  const content = (type: ChatMessageType) => {
    switch (type) {
      case ChatMessageType.TEXT:
        return parentMessage.content;
      case ChatMessageType.IMAGE:
        return '写真';
      case ChatMessageType.VIDEO:
        return '動画';
      case ChatMessageType.OTHER_FILE:
        return 'ファイル';
    }
  };

  return (
    <Div
      flexDir="row"
      alignItems="center"
      borderBottomWidth={0.5}
      borderBottomColor="white"
      pb="sm"
      mb="sm">
      <Image
        w={32}
        h={32}
        mr={'sm'}
        source={
          parentMessage.sender?.avatarUrl
            ? {uri: parentMessage.sender?.avatarUrl}
            : require('../../../../../assets/no-image-avatar.png')
        }
      />
      <Div w={'65%'}>
        <Text
          color="white"
          fontWeight="bold"
          fontSize={14}
          borderBottomWidth={1}
          borderBottomColor="white">
          {userNameFactory(parentMessage.sender)}
        </Text>
        <Text
          color="white"
          fontSize={14}
          borderBottomWidth={1}
          borderBottomColor="white">
          {content(parentMessage.type)}
        </Text>
      </Div>
      {parentMessage.type === ChatMessageType.IMAGE ? (
        <Image
          w={40}
          h={40}
          source={
            parentMessage.content
              ? {uri: parentMessage.content}
              : require('../../../../../assets/no-image.jpg')
          }
        />
      ) : parentMessage.type === ChatMessageType.VIDEO ? (
        <Image
          w={40}
          h={40}
          source={
            parentMessage.thumbnail
              ? {uri: parentMessage.thumbnail}
              : require('../../../../../assets/no-image.jpg')
          }
        />
      ) : null}
    </Div>
  );
};

export default ReplyParent;
