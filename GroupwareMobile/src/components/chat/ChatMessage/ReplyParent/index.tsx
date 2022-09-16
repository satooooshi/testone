import React, {useCallback, useState} from 'react';
import {TouchableOpacity} from 'react-native-gesture-handler';
import {Button, Div, Image, Text} from 'react-native-magnus';
import {ChatMessage, ChatMessageType} from '../../../../types';
import {reactionStickers} from '../../../../utils/factory/reactionStickers';
import {userNameFactory} from '../../../../utils/factory/userNameFactory';
import {mentionTransform} from '../../../../utils/messageTransform';
import UserAvatar from '../../../common/UserAvatar';
import {getThumbnailOfVideo} from '../../../../utils/getThumbnailOfVideo';

type ReplyParentProps = {
  parentMessage: ChatMessage;
  isSender?: boolean;
};

const ReplyParent: React.FC<ReplyParentProps> = ({parentMessage}) => {
  const Limit_LINES = 3;
  const [pressed, setPressed] = useState(false);
  const [numberOfLines, setNumberOfLines] = useState(0);

  const onTextLayout = useCallback(e => {
    setNumberOfLines(e.nativeEvent.lines.length);
  }, []);

  const FoldedTextMessage = (msg: String) => {
    return (
      <>
        <TouchableOpacity onPress={() => setPressed(true)}>
          <Text
            mb={10}
            numberOfLines={pressed ? undefined : Limit_LINES}
            onTextLayout={onTextLayout}
            textAlign="left">
            {msg}
          </Text>
        </TouchableOpacity>
        {pressed && numberOfLines > 3 ? (
          <Button
            mb={5}
            pt={5}
            pb={5}
            color="black"
            underlayColor="white"
            rounded={20}
            fontSize={13}
            bg="transparent"
            ml="auto"
            mr={0}
            onPress={() => setPressed(false)}>
            閉じる
          </Button>
        ) : null}
      </>
    );
  };

  const content = (type: ChatMessageType) => {
    switch (type) {
      case ChatMessageType.TEXT:
        return FoldedTextMessage(mentionTransform(parentMessage.content));

      case ChatMessageType.IMAGE:
        return (
          <Text color="black" fontSize={14}>
            写真
          </Text>
        );
      case ChatMessageType.VIDEO:
        return (
          <Text color="black" fontSize={14}>
            動画
          </Text>
        );
      case ChatMessageType.STICKER:
        return (
          <Text color="black" fontSize={14}>
            スタンプ
          </Text>
        );
      case ChatMessageType.OTHER_FILE:
        return (
          <Text color="black" fontSize={14}>
            ファイル
          </Text>
        );
    }
  };
  const getThumbnailImage = (message: ChatMessage) => {
    const getThumbnail = async () => {
      message.thumbnail = await getThumbnailOfVideo(
        message.content,
        message.fileName,
      );
    };
    if (!message.thumbnail) {
      getThumbnail();
      return message.thumbnail;
    }
    return message.thumbnail;
  };

  return (
    <Div
      flexDir="row"
      alignItems="center"
      borderBottomWidth={0.5}
      borderBottomColor="white">
      <Div mr={'sm'}>
        <UserAvatar
          w={32}
          h={32}
          user={parentMessage.sender}
          GoProfile={true}
        />
      </Div>
      <Div w={'65%'} mr={0}>
        <Text color="black" fontWeight="bold" fontSize={14}>
          {userNameFactory(parentMessage.sender)}
        </Text>
        {content(parentMessage.type)}
      </Div>
      {parentMessage.type === ChatMessageType.IMAGE ? (
        <Image
          w={40}
          h={40}
          mb={5}
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
          mb={5}
          source={
            parentMessage.thumbnail
              ? {uri: parentMessage.thumbnail}
              : {uri: getThumbnailImage(parentMessage)}
          }
        />
      ) : parentMessage.type === ChatMessageType.STICKER ? (
        <Image
          w={40}
          h={40}
          mb={5}
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
