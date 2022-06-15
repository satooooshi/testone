import { Box, Image } from '@chakra-ui/react';
import React from 'react';
import { ChatMessage } from 'src/types';
import { reactionStickers } from 'src/utils/reactionStickers';

type StickerMessageProps = {
  message: ChatMessage;
};

const StickerMessage: React.FC<StickerMessageProps> = ({ message }) => {
  return (
    <Box
      display="flex"
      justifyContent={message.isSender ? 'flex-end' : 'flex-start'}
      maxW="300px"
      maxH={'300px'}>
      <Image
        loading="lazy"
        src={reactionStickers.find((s) => s.name === message.content)?.src}
        w={150}
        h={150}
        alt="送信された画像"
      />
    </Box>
  );
};

export default StickerMessage;
