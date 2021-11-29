import React from 'react';
import {TouchableOpacity} from 'react-native';
import {Div, Icon, Image, Text} from 'react-native-magnus';
import {replyTargetStyles} from '../../../styles/component/chat/replyTarget.style';
import {ChatMessage, ChatMessageType} from '../../../types';
import {darkFontColor} from '../../../utils/colors';
import {userNameFactory} from '../../../utils/factory/userNameFactory';

type ReplyTargetProps = {
  onPressCloseIcon: () => void;
  replyParentMessage: ChatMessage;
};

const ReplyTarget: React.FC<ReplyTargetProps> = ({
  onPressCloseIcon,
  replyParentMessage,
}) => {
  const content = (type: ChatMessageType) => {
    switch (type) {
      case ChatMessageType.TEXT:
        return replyParentMessage.content;
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
      bg="white"
      flexDir="row"
      alignSelf="center"
      w={'100%'}
      py={'lg'}
      px={'sm'}>
      <TouchableOpacity
        style={replyTargetStyles.closeReplyIcon}
        onPress={onPressCloseIcon}>
        <Icon name="close" fontSize={24} />
      </TouchableOpacity>
      <Image
        mr={'lg'}
        w={40}
        h={40}
        rounded="circle"
        source={
          replyParentMessage?.sender?.avatarUrl
            ? {uri: replyParentMessage.sender.avatarUrl}
            : require('../../../../assets/no-image-avatar.png')
        }
      />
      <Div alignSelf="center" w={'70%'}>
        <Text fontSize={12} fontWeight={'bold'} numberOfLines={1}>
          {userNameFactory(replyParentMessage?.sender)}
        </Text>
        <Text numberOfLines={1} color={darkFontColor} fontSize={12}>
          {content(replyParentMessage.type)}
        </Text>
      </Div>

      {replyParentMessage.type === ChatMessageType.IMAGE ? (
        <Image
          w={40}
          h={40}
          source={
            replyParentMessage.content
              ? {uri: replyParentMessage.content}
              : require('../../../../assets/no-image.jpg')
          }
        />
      ) : replyParentMessage.type === ChatMessageType.VIDEO ? (
        <Image
          w={40}
          h={40}
          source={
            replyParentMessage.thumbnail
              ? {uri: replyParentMessage.thumbnail}
              : require('../../../../assets/no-image.jpg')
          }
        />
      ) : null}
    </Div>
  );
};

export default ReplyTarget;
