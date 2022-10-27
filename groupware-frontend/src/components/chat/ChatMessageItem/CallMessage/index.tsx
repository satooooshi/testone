import { Box, Text } from '@chakra-ui/react';
import React from 'react';
import { ChatMessage } from 'src/types';
import { IoCall } from 'react-icons/io5';

type CallMessageProps = {
  message: ChatMessage;
};

const CallMessage: React.FC<CallMessageProps> = ({ message }) => {
  return (
    <Box
      w={150}
      h={50}
      bg={message.isSender ? 'blue.500' : '#ececec'}
      p="8px"
      rounded="md"
      display="flex"
      flexDirection="row"
      alignItems="center">
      <Box
        w={8}
        h={8}
        rounded="full"
        display="flex"
        bg={message.isSender ? 'blue.400' : 'gray.300'}
        alignItems="center"
        justifyContent="center">
        <IoCall color="white" />
      </Box>
      <Box ml={2} flexDir="column" display="flex" alignItems="center">
        <Text
          fontSize={15}
          color={message.isSender ? 'white' : 'black'}
          bg={message.isSender ? 'blue.500' : '#ececec'}>
          message.content
        </Text>

        <Text mt={1} fontSize={11} color={message.isSender ? 'white' : 'black'}>
          {message.callTime}
        </Text>
      </Box>
    </Box>
  );
};

export default CallMessage;
