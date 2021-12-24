import UserAvatar from '@/components/common/UserAvatar';
import { Box, Text, useMediaQuery } from '@chakra-ui/react';
import React from 'react';
import { ChatMessage, ChatMessageType } from 'src/types';
import { darkFontColor } from 'src/utils/colors';
import { userNameFactory } from 'src/utils/factory/userNameFactory';
import { mentionTransform } from 'src/utils/mentionTransform';
import Linkify from 'react-linkify';

type TextMessageProps = {
  message: ChatMessage;
};

const TextMessage: React.FC<TextMessageProps> = ({ message }) => {
  const [isSmallerThan768] = useMediaQuery('(max-width: 768px)');
  const replyContent = (parentMsg: ChatMessage) => {
    switch (parentMsg.type) {
      case ChatMessageType.TEXT:
        return mentionTransform(parentMsg.content);
      case ChatMessageType.IMAGE:
        return '写真';
      case ChatMessageType.VIDEO:
        return '動画';
      case ChatMessageType.OTHER_FILE:
        return 'ファイル';
    }
  };

  return (
    <Box
      maxW={isSmallerThan768 ? '140px' : '40vw'}
      minW={'10vw'}
      bg={message.isSender ? 'blue.500' : '#ececec'}
      p="8px"
      rounded="md">
      <Linkify>
        {message.replyParentMessage && (
          <Box
            flexDir="row"
            display="flex"
            borderBottomWidth={1}
            borderBottomColor={'white'}
            pb="4px"
            color={'black'}>
            <UserAvatar
              h="32px"
              w="32px"
              mr="4px"
              cursor="pointer"
              user={message.replyParentMessage.sender}
            />
            <Box>
              <Text fontWeight="bold">
                {userNameFactory(message.replyParentMessage?.sender)}
              </Text>
              <Text>{replyContent(message.replyParentMessage)}</Text>
            </Box>
          </Box>
        )}
        <Text
          borderRadius="8px"
          maxW={'40vw'}
          minW={'10vw'}
          wordBreak={'break-word'}
          color={message.isSender ? 'white' : darkFontColor}
          bg={message.isSender ? 'blue.500' : '#ececec'}>
          {mentionTransform(message.content)}
        </Text>
      </Linkify>
    </Box>
  );
};

export default TextMessage;
