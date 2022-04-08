import { Box } from '@chakra-ui/react';
import React from 'react';
import { ChatMessage } from 'src/types';

type VideoMessageProps = {
  message: ChatMessage;
};

const VideoMessage: React.FC<VideoMessageProps> = ({ message }) => {
  return (
    <Box display="flex" maxW="300px" maxH={'300px'}>
      <video src={message.content} controls width={300} height={300} />
    </Box>
  );
};

export default VideoMessage;
