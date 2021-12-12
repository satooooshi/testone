import React, { useState } from 'react';
import { ChatGroup, ChatMessage, ChatMessageType, User } from 'src/types';
import { dateTimeFormatterFromJSDDate } from 'src/utils/dateTimeFormatter';
import { Avatar, Box, useMediaQuery, Text, Link } from '@chakra-ui/react';
import { darkFontColor } from 'src/utils/colors';
import { useAPISaveChatGroup } from '@/hooks/api/chat/useAPISaveChatGroup';
import { RiPushpin2Fill, RiPushpin2Line } from 'react-icons/ri';

type ChatGroupCardProps = {
  chatGroup: ChatGroup;
  isSelected?: boolean;
};

const ChatGroupCard: React.FC<ChatGroupCardProps> = ({
  chatGroup,
  isSelected = false,
}) => {
  const [isPinned, setIsPinned] = useState<boolean>(!!chatGroup.isPinned);
  const { mutate: saveGroup } = useAPISaveChatGroup({
    onSuccess: () => {
      setIsPinned(!isPinned);
    },
  });
  const [isSmallerThan768] = useMediaQuery('max-width: 768px');
  const nameOfEmptyNameGroup = (members?: User[]): string => {
    if (!members) {
      return 'メンバーがいません';
    }
    const strMembers = members?.map((m) => m.lastName + m.firstName).toString();
    if (strMembers.length > 15) {
      return strMembers.slice(0, 15) + '...(' + members.length + ')';
    }
    return strMembers.toString();
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
      bg={isSelected ? '#f2f1f2' : 'white'}>
      <Avatar src={chatGroup.imageURL} size="md" mr="8px" />
      <Box
        display="flex"
        flexDir="column"
        overflow="hidden"
        w={isSmallerThan768 ? '100%' : '80%'}
        h="60px"
        justifyContent="space-around">
        <Box
          display="flex"
          flexDir="row"
          justifyContent="space-between"
          alignItems="center"
          w="100%">
          <Text fontWeight="bold" color={darkFontColor} noOfLines={1}>
            {chatGroup.name
              ? chatGroup.name
              : nameOfEmptyNameGroup(chatGroup.members)}
          </Text>
          {isPinned ? (
            <Link
              onClick={(e) => {
                e.stopPropagation();
                saveGroup({ ...chatGroup, isPinned: !chatGroup.isPinned });
              }}>
              <RiPushpin2Fill size={24} color="green" />
            </Link>
          ) : (
            <Link
              onClick={(e) => {
                e.stopPropagation();
                saveGroup({ ...chatGroup, isPinned: !chatGroup.isPinned });
              }}>
              <RiPushpin2Line size={24} color="green" />
            </Link>
          )}
        </Box>
        <Box display="flex" flexDir="row" alignItems="center">
          <Text fontSize="12px" color={darkFontColor} noOfLines={1}>
            {chatGroup?.chatMessages?.length
              ? latestMessage(chatGroup.chatMessages[0])
              : ' '}
          </Text>
        </Box>
        <Box
          display="flex"
          flexDir="row"
          justifyContent="flex-end"
          alignItems="center">
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
