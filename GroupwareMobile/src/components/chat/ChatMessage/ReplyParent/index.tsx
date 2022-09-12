import React from 'react';
import {Div, Image, Text} from 'react-native-magnus';
import {ChatMessage, ChatMessageType, User} from '../../../../types';
import {reactionStickers} from '../../../../utils/factory/reactionStickers';
import {userNameFactory} from '../../../../utils/factory/userNameFactory';
import {mentionTransform} from '../../../../utils/messageTransform';
import UserAvatar from '../../../common/UserAvatar';

type ReplyParentProps = {
  parentMessage: ChatMessage;
  isSender?: boolean;
  senderAvatar?: {
    member: User;
    avatar: JSX.Element;
  };
};

const ReplyParent: React.FC<ReplyParentProps> = ({
  parentMessage,
  isSender,
  senderAvatar,
}) => {
  const content = (type: ChatMessageType) => {
    switch (type) {
      case ChatMessageType.TEXT:
        return mentionTransform(parentMessage.content);
      case ChatMessageType.IMAGE:
        return '写真';
      case ChatMessageType.VIDEO:
        return '動画';
      case ChatMessageType.STICKER:
        return 'スタンプ';
      case ChatMessageType.OTHER_FILE:
        return 'ファイル';
    }
  };

  return (
    <Div
      flexDir="row"
      alignItems="center"
      borderBottomWidth={0.5}
      borderBottomColor="black"
      pb="sm">
      <Div mr={'sm'}>
        <UserAvatar
          w={32}
          h={32}
          user={senderAvatar?.member}
          GoProfile={true}
        />
      </Div>
      <Div w={'65%'}>
        <Text color={isSender ? 'white' : 'black'} fontSize={14}>
          {userNameFactory(senderAvatar?.member)}
        </Text>
        <Text color={isSender ? 'white' : 'black'} fontSize={14}>
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
      ) : parentMessage.type === ChatMessageType.STICKER ? (
        <Image
          w={40}
          h={40}
          resizeMode="contain"
          source={
            reactionStickers.find(s => s.name === parentMessage.content)?.src
          }
        />
      ) : null}
    </Div>
  );
};

export default ReplyParent;
