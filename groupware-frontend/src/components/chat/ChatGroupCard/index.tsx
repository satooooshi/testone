import React, { useMemo } from 'react';
import { ChatGroup, ChatMessage, ChatMessageType, User } from 'src/types';
import { dateTimeFormatterFromJSDDate } from 'src/utils/dateTimeFormatter';
import {
  Avatar,
  Box,
  useMediaQuery,
  Text,
  Link,
  Badge,
} from '@chakra-ui/react';
import { brandColor, darkFontColor } from 'src/utils/colors';
import { RiPushpin2Fill, RiPushpin2Line } from 'react-icons/ri';
import { nameOfEmptyNameGroup } from 'src/utils/chat/nameOfEmptyNameGroup';
import { useAuthenticate } from 'src/contexts/useAuthenticate';
import { mentionTransform } from 'src/utils/mentionTransform';

type ChatGroupCardProps = {
  chatGroup: ChatGroup;
  isSelected?: boolean;
  onPressPinButton: () => void;
};

const ChatGroupCard: React.FC<ChatGroupCardProps> = ({
  chatGroup,
  isSelected = false,
  onPressPinButton,
}) => {
  const [isSmallerThan768] = useMediaQuery('max-width: 768px');
  const { user } = useAuthenticate();

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

  const avatarImage = useMemo(() => chatGroup.imageURL, [chatGroup.imageURL]);

  return (
    <Box
      rounded={10}
      display="flex"
      flexDir="row"
      py="16px"
      px="12px"
      alignItems="center"
      boxShadow="md"
      w={'100%'}
      h="100px"
      borderWidth={2}
      borderColor={isSelected ? 'brand.300' : undefined}
      bg={isSelected ? 'gray.100' : 'white'}>
      <Box display="flex" flexDir="column">
        <Link
          rounded="full"
          w="26px"
          h="26px"
          // lineHeight="35px"
          // textAlign="center"
          bg="white"
          zIndex={2}
          mb={-4}
          ml={-1}
          borderWidth="2px"
          borderColor="gray.200"
          onClick={(e) => {
            e.stopPropagation();
            onPressPinButton();
          }}>
          {!!chatGroup.isPinned ? (
            <RiPushpin2Fill size={22} color={brandColor} />
          ) : (
            <RiPushpin2Line size={22} color={brandColor} />
          )}
        </Link>
        <Avatar src={avatarImage} size="md" mr="8px" />
      </Box>
      <Box
        display="flex"
        flexDir="column"
        overflow="hidden"
        w="100%"
        h="70px"
        justifyContent="space-around">
        <Box
          display="flex"
          flexDir="row"
          justifyContent="space-between"
          alignItems="center"
          mb="3px"
          w="100%">
          <Text fontWeight="bold" color={darkFontColor} noOfLines={1}>
            {nameOfEmptyNameGroup(chatGroup)}
          </Text>
          <Text color={darkFontColor} fontSize="12px" whiteSpace="nowrap">
            {dateTimeFormatterFromJSDDate({
              dateTime: new Date(chatGroup.updatedAt),
            })}
          </Text>
        </Box>
        <Text color={darkFontColor} fontSize="14px">
          {`${chatGroup.members?.length || 0}人のメンバー`}
        </Text>
        <Box
          display="flex"
          flexDir="row"
          alignItems="center"
          my="4px"
          justifyContent="space-between">
          <Text fontSize="15px" noOfLines={1}>
            {chatGroup?.chatMessages?.length
              ? latestMessage(chatGroup.chatMessages[0])
              : ' '}
          </Text>
          <Box display="flex" flexDir="row">
            {isSelected == false &&
            chatGroup?.unreadCount &&
            chatGroup.unreadCount > 0 ? (
              <Badge
                bg="red"
                color="white"
                minW="25px"
                h="25px"
                borderRadius="50%"
                textAlign="center"
                lineHeight="25px">
                {chatGroup.unreadCount}
              </Badge>
            ) : null}
          </Box>
        </Box>
        {/* <Box
          display="flex"
          flexDir="row"
          justifyContent="space-between"
          alignItems="center">
          <Text color={darkFontColor} fontSize="12px">
            {dateTimeFormatterFromJSDDate({
              dateTime: new Date(
                chatGroup?.chatMessages?.[0]?.createdAt
                  ? chatGroup?.chatMessages?.[0]?.createdAt
                  : chatGroup.createdAt,
              ),
            })}
          </Text>
        </Box> */}
      </Box>
    </Box>
  );
};

export default ChatGroupCard;
