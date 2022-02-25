import UserAvatar from '@/components/common/UserAvatar';
import { Box, Text, useMediaQuery } from '@chakra-ui/react';
import React from 'react';
import { ChatMessage, ChatMessageType } from 'src/types';
import { darkFontColor } from 'src/utils/colors';
import { userNameFactory } from 'src/utils/factory/userNameFactory';
import { mentionTransform } from 'src/utils/mentionTransform';
import Linkify from 'react-linkify';
import { IoCall } from 'react-icons/io5';

type CallMessageProps = {
  message: ChatMessage;
};

const CallMessage: React.FC<CallMessageProps> = ({ message }) => {
  return (
    <Box
      w={'100'}
      h={'100'}
      bg={message.isSender ? 'blue.500' : '#ececec'}
      p="8px"
      rounded="md">
      <Linkify>
        <IoCall />
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

export default CallMessage;
