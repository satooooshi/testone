import { Box, Text } from '@chakra-ui/react';
import React from 'react';
import { ChatMessage } from 'src/types';

type SystemMessageProps = {
  message: ChatMessage;
};

const SystemMessage: React.FC<SystemMessageProps> = ({ message }) => {
  return (
    <Box
      bg="#ececec"
      borderRadius="md"
      alignSelf="center"
      display="flex"
      flexDir="row"
      justifyContent="center"
      alignItems="center"
      minW="60%"
      minH={'24px'}
      mb={'8px'}
      maxW="50vw">
      <Text fontSize={'14px'}>{message.content}</Text>
    </Box>
  );
};

export default SystemMessage;
