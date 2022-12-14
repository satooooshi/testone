import React, {ReactNode, memo} from 'react';
import {useEffect} from 'react';
import {useNavigation} from '@react-navigation/native';
import {
  TouchableHighlight,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import {Box, Div, Text} from 'react-native-magnus';
import {
  ChatMessage,
  ChatMessageReaction,
  ChatMessageType,
  User,
} from '../../../types';
import {dateTimeFormatterFromJSDDate} from '../../../utils/dateTimeFormatterFromJSDate';
import {userNameFactory} from '../../../utils/factory/userNameFactory';
import {numbersOfSameValueInKeyOfObjArr} from '../../../utils/numbersOfSameValueInKeyOfObjArr';
import FileMessage from './FileMessage';
import ImageMessage from './ImageMessage';
import ReactionToMessage from './ReactionToMessage';
import TextMessage from './TextMessage';
import CallMessage from './CallMessage';
import VideoMessage from './VideoMessage';
import StickerMessage from './StickerMessage.tsx';
import {removeReactionDuplicates} from '../../../utils/removeReactionDuplicate';
import UserAvatar from '../../../components/common/UserAvatar';

type ChatMessageItemProps = {
  message: ChatMessage;
  readUsers: User[];
  inputtedSearchWord?: string;
  searchedResultIds?: (number | undefined)[];
  messageIndex: number;
  isScrollTarget: boolean;
  senderAvatars?: {
    member: User;
    avatar: JSX.Element;
  }[];
  scrollToTarget: (messageIndex: number) => void;
  onCheckLastRead: () => void;
  onLongPress: () => void;
  onPressImage: () => void;
  onPressVideo: () => void;
  onPressReaction: (reaction: ChatMessageReaction, isSender: boolean) => void;
  onLongPressReation: (reaction: ChatMessageReaction) => void;
};

const ChatMessageItem: React.FC<ChatMessageItemProps> = ({
  message,
  readUsers,
  inputtedSearchWord,
  searchedResultIds,
  messageIndex,
  isScrollTarget = false,
  scrollToTarget,
  senderAvatars,
  onCheckLastRead,
  onLongPress,
  onPressImage,
  onPressVideo,
  onPressReaction,
  onLongPressReation,
}) => {
  const navigation = useNavigation<any>();
  const windowWidth = useWindowDimensions().width;
  const isSender = (emoji: string) => {
    if (!message?.reactions) {
      return false;
    }
    return message?.reactions?.some(r => r.emoji === emoji && r.isSender);
  };

  useEffect(() => {
    if (isScrollTarget) {
      scrollToTarget(messageIndex);
    }
  }, [isScrollTarget, scrollToTarget, messageIndex]);

  const timesAndReadCounts = (
    <Div justifyContent="flex-end" alignItems="center">
      {readUsers.length && message.type !== ChatMessageType.SYSTEM_TEXT ? (
        <TouchableOpacity onPress={onCheckLastRead}>
          <Text
            mb="sm"
            mr={message?.isSender ? 'sm' : undefined}
            ml={!message?.isSender ? 'sm' : undefined}>
            {`??????${readUsers.length}???`}
          </Text>
        </TouchableOpacity>
      ) : null}
      {message.type !== ChatMessageType.SYSTEM_TEXT ? (
        <Text
          fontSize={12}
          mr={message?.isSender ? 'sm' : undefined}
          ml={!message?.isSender ? 'sm' : undefined}>
          {dateTimeFormatterFromJSDDate({
            dateTime: new Date(message.createdAt),
            format: 'LL/dd HH:mm',
          })}
        </Text>
      ) : null}
    </Div>
  );

  if (!message.content) {
    return <></>;
  }

  return (
    <>
      {message.type === ChatMessageType.SYSTEM_TEXT && (
        <Box
          alignSelf="center"
          bg="#F2F5FB"
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
        alignItems="flex-start">
        <Div>
          {!message.isSender && message.type !== ChatMessageType.SYSTEM_TEXT ? (
            <Text>
              {userNameFactory(
                senderAvatars?.find(s => s.member.id === message.sender?.id)
                  ?.member || message.sender,
              )}
            </Text>
          ) : null}
          <Div flexDir="row" alignItems="flex-end">
            {message.isSender && timesAndReadCounts}
            {message.type === ChatMessageType.TEXT ? (
              <TextMessage
                senderAvatars={senderAvatars}
                message={message}
                inputtedSearchWord={inputtedSearchWord}
                searchedResultIds={searchedResultIds}
                onLongPress={onLongPress}
              />
            ) : message.type === ChatMessageType.CALL ? (
              <CallMessage message={message} onLongPress={onLongPress} />
            ) : message.type === ChatMessageType.IMAGE ? (
              <ImageMessage
                onPress={onPressImage}
                message={message}
                onLongPress={onLongPress}
              />
            ) : message.type === ChatMessageType.STICKER ? (
              <StickerMessage message={message} onLongPress={onLongPress} />
            ) : message.type === ChatMessageType.VIDEO ? (
              <VideoMessage
                message={message}
                onPress={onPressVideo}
                onLongPress={onLongPress}
              />
            ) : message.type === ChatMessageType.OTHER_FILE ? (
              <FileMessage message={message} onLongPress={onLongPress} />
            ) : null}
            {!message.isSender && timesAndReadCounts}
          </Div>
        </Div>
        {!message.isSender && message.type !== ChatMessageType.SYSTEM_TEXT ? (
          <TouchableHighlight
            onPress={() =>
              navigation.navigate('AccountStack', {
                screen: 'AccountDetail',
                params: {id: message.sender?.id},
              })
            }
            underlayColor="none">
            <Div mr="xs">
              {senderAvatars?.find(s => s.member.id === message.sender?.id)
                ?.avatar ?? <UserAvatar h={40} w={40} user={message.sender} />}
            </Div>
          </TouchableHighlight>
        ) : null}
      </Div>
      <Div
        maxW={windowWidth * 0.6}
        flexDir="row"
        flexWrap="wrap"
        alignSelf={message?.isSender ? 'flex-end' : 'flex-start'}>
        {message.reactions?.length
          ? removeReactionDuplicates(message.reactions).map(r => (
              <Div mr="xs" mb="xs" key={r.id}>
                <ReactionToMessage
                  onPress={() => onPressReaction(r, isSender(r.emoji))}
                  onLongPress={() => onLongPressReation(r)}
                  reaction={{...r, isSender: !!isSender(r.emoji)}}
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

export default memo(ChatMessageItem);
