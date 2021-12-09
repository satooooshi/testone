import React from 'react';
import {TouchableOpacity, useWindowDimensions} from 'react-native';
import {Box, Div, Image, Text} from 'react-native-magnus';
import {
  ChatMessage,
  ChatMessageReaction,
  ChatMessageType,
  User,
} from '../../../types';
import {numbersOfSameValueInKeyOfObjArr} from '../../../utils/numbersOfSameValueInKeyOfObjArr';
import FileMessage from './FileMessage';
import ImageMessage from './ImageMessage';
import ReactionToMessage from './ReactionToMessage';
import TextMessage from './TextMessage';
import VideoMessage from './VideoMessage';

type ChatMessageItemProps = {
  message: ChatMessage;
  readUsers: User[];
  onCheckLastRead: () => void;
  numbersOfRead: number;
  onLongPress: () => void;
  onPressImage: () => void;
  onPressVideo: () => void;
  onPressFile: () => void;
  onPressReaction: (reaction: ChatMessageReaction) => void;
  onLongPressReation: (reaction: ChatMessageReaction) => void;
  deletedReactionIds: number[];
};

const ChatMessageItem: React.FC<ChatMessageItemProps> = ({
  message,
  readUsers,
  onCheckLastRead,
  numbersOfRead,
  onLongPress,
  onPressImage,
  onPressVideo,
  onPressFile,
  onPressReaction,
  onLongPressReation,
  deletedReactionIds,
}) => {
  const windowWidth = useWindowDimensions().width;
  const reactionRemovedDuplicates = (reactions: ChatMessageReaction[]) => {
    const reactionsNoDuplicates: ChatMessageReaction[] = [];
    for (const r of reactions) {
      if (
        reactionsNoDuplicates.filter(
          duplicated => duplicated.isSender || duplicated.emoji !== r.emoji,
        )
      ) {
        reactionsNoDuplicates.push(r);
      }
    }
    return reactionsNoDuplicates;
  };
  return (
    <>
      {message.type === ChatMessageType.SYSTEM_TEXT && (
        <Box
          alignSelf="center"
          bg="gray300"
          w={windowWidth * 0.8}
          rounded={'md'}
          py={4}
          justifyContent="center"
          alignItems="center">
          <Text color="black">{message.content}</Text>
        </Box>
      )}
      <Div
        flexDir={message.isSender ? 'row' : 'row-reverse'}
        mb={'xs'}
        alignSelf={message?.isSender ? 'flex-end' : 'flex-start'}
        alignItems="flex-end">
        {readUsers.length && message.type !== ChatMessageType.SYSTEM_TEXT ? (
          <TouchableOpacity onPress={onCheckLastRead}>
            <Text
              mb="sm"
              mr={message?.isSender ? 'sm' : undefined}
              ml={!message?.isSender ? 'sm' : undefined}>
              {numbersOfRead ? `既読\n${numbersOfRead}人` : ''}
            </Text>
          </TouchableOpacity>
        ) : null}
        {message.type === ChatMessageType.TEXT ? (
          <TextMessage message={message} onLongPress={onLongPress} />
        ) : message.type === ChatMessageType.IMAGE ? (
          <ImageMessage
            onPress={onPressImage}
            message={message}
            onLongPress={onLongPress}
          />
        ) : message.type === ChatMessageType.VIDEO ? (
          <VideoMessage
            message={message}
            onPress={onPressVideo}
            onLongPress={onLongPress}
          />
        ) : message.type === ChatMessageType.OTHER_FILE ? (
          <FileMessage
            message={message}
            onPress={onPressFile}
            onLongPress={onLongPress}
          />
        ) : null}
        {!message.isSender && message.type !== ChatMessageType.SYSTEM_TEXT ? (
          <Image
            source={
              message?.sender?.avatarUrl
                ? {uri: message?.sender?.avatarUrl}
                : require('../../../../assets/no-image-avatar.png')
            }
            h={40}
            w={40}
            rounded="circle"
          />
        ) : null}
      </Div>
      <Div
        maxW={windowWidth * 0.6}
        flexDir="row"
        flexWrap="wrap"
        alignSelf={message?.isSender ? 'flex-end' : 'flex-start'}>
        {message.reactions?.length
          ? reactionRemovedDuplicates(message.reactions)
              .filter(r => !deletedReactionIds.includes(r.id))
              .map(r => (
                <Div mr="xs" mb="xs">
                  <ReactionToMessage
                    onPress={() => onPressReaction(r)}
                    onLongPress={() => onLongPressReation(r)}
                    reaction={r}
                    numbersOfReaction={numbersOfSameValueInKeyOfObjArr(
                      message.reactions as ChatMessageReaction[],
                      r,
                      'emoji',
                    )}
                  />
                </Div>
              ))
          : null}
      </Div>
    </>
  );
};

export default ChatMessageItem;
