import { Box, Image } from '@chakra-ui/react';
import React from 'react';
import { ChatMessage } from 'src/types';

type ImageMessageProps = {
  message: ChatMessage;
  onClick: () => void;
};

const ImageMessage: React.FC<ImageMessageProps> = ({ message, onClick }) => {
  return (
    <a onClick={onClick}>
      <Box display="flex" maxW="300px" maxH={'300px'}>
        <Image
          loading="lazy"
          src={message.content}
          w={300}
          h={300}
          alt="送信された画像"
        />
      </Box>
    </a>
  );
};

export default ImageMessage;
