import { Box, Image } from '@chakra-ui/react';
import React from 'react';
import { ChatMessage } from 'src/types';

type ImageMessageProps = {
  message: ChatMessage;
};

const ImageMessage: React.FC<ImageMessageProps> = ({ message }) => {
  return (
    <Box display="flex" maxW="300px" maxH={'300px'}>
      <Image src={message.content} w={300} h={300} alt="送信された画像" />
    </Box>
  );
};

export default ImageMessage;
