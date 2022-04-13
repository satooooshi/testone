import React, { useState } from 'react';
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
import { darkFontColor } from 'src/utils/colors';
import { RiPushpin2Fill, RiPushpin2Line } from 'react-icons/ri';
import { useRoomRefetch } from 'src/contexts/chat/useRoomRefetch';
import { useAPISavePin } from '@/hooks/api/chat/useAPISavePin';

type ChatGroupCardProps = {
  chatGroup: ChatGroup;
  isSelected?: boolean;
};

const ChatGroupCard: React.FC<ChatGroupCardProps> = ({
  chatGroup,
  isSelected = false,
}) => {
  const { needRefetch } = useRoomRefetch();
  const [isPinned, setIsPinned] = useState<boolean>(!!chatGroup.isPinned);

  const { mutate: savePin } = useAPISavePin({
    onSuccess: () => {
      setIsPinned(!isPinned);
      needRefetch();
    },
    onError: () => {
      alert(
        'ピン留めを更新中にエラーが発生しました。\n時間をおいて再実行してください。',
      );
    },
  });
  const [isSmallerThan768] = useMediaQuery('max-width: 768px');
  const nameOfEmptyNameGroup = (members?: User[]): string => {
    if (!members) {
      return 'メンバーがいません';
    }
    const strMembers = members?.map((m) => m.lastName + m.firstName).join();
    return strMembers;
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
    <Box
      display="flex"
      flexDir="row"
      py="16px"
      px="12px"
      alignItems="center"
      boxShadow="md"
      w={'100%'}
      h="fit-content"
      bg={
        isSelected ? 'gray.200' : chatGroup.hasBeenRead ? '#f2f1f2' : 'white'
      }>
      <Avatar src={chatGroup.imageURL} size="md" mr="8px" />
      <Box
        display="flex"
        flexDir="column"
        overflow="hidden"
        w={isSmallerThan768 ? '100%' : '80%'}
        h="70px"
        justifyContent="space-around">
        <Box
          display="flex"
          flexDir="row"
          justifyContent="space-between"
          alignItems="center"
          mb="4px"
          w="100%">
          <Text fontWeight="bold" color={darkFontColor} noOfLines={1}>
            {chatGroup.name
              ? chatGroup.name
              : nameOfEmptyNameGroup(chatGroup.members)}
          </Text>

          <Box display="flex" flexDir="row">
            {isSelected == false &&
            chatGroup?.unreadCount &&
            chatGroup?.unreadCount > 0 ? (
              <Badge
                bg="red"
                color="white"
                w="30px"
                h="30px"
                mr="20px"
                borderRadius="50%"
                textAlign="center"
                lineHeight="30px">
                {chatGroup?.unreadCount}
              </Badge>
            ) : null}
            {isPinned ? (
              <Link
                onClick={(e) => {
                  e.stopPropagation();
                  savePin({ ...chatGroup, isPinned: !chatGroup.isPinned });
                }}>
                <RiPushpin2Fill size={24} color="green" />
              </Link>
            ) : (
              <Link
                onClick={(e) => {
                  e.stopPropagation();
                  savePin({ ...chatGroup, isPinned: !chatGroup.isPinned });
                }}>
                <RiPushpin2Line size={24} color="green" />
              </Link>
            )}
          </Box>
        </Box>
        <Box display="flex" flexDir="row" alignItems="center" mb="4px">
          <Text fontSize="12px" color={darkFontColor} noOfLines={1}>
            {chatGroup?.chatMessages?.length
              ? latestMessage(chatGroup.chatMessages[0])
              : ' '}
          </Text>
        </Box>
        <Box
          display="flex"
          flexDir="row"
          justifyContent="space-between"
          alignItems="center">
          <Text color={darkFontColor} fontSize="14px">
            {`${chatGroup.members?.length || 0}人のメンバー`}
          </Text>
          <Text color={darkFontColor} fontSize="12px">
            {dateTimeFormatterFromJSDDate({
              dateTime: new Date(chatGroup.updatedAt),
            })}
          </Text>
        </Box>
      </Box>
    </Box>
  );
};

export default ChatGroupCard;
