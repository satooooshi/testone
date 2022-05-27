import { Box } from '@chakra-ui/react';
import React from 'react';
import { ChatMessage } from 'src/types';
import ReactPlayer from 'react-player';

type VideoMessageProps = {
  message: ChatMessage;
};

const VideoMessage: React.FC<VideoMessageProps> = ({ message }) => {
  return (
    <Box display="flex" maxW="300px" maxH={'300px'}>
      <ReactPlayer
        url={message.content}
        width={300}
        height={300}
        config={{
          file: {
            attributes: {
              controlsList: 'nodownload',
            },
          },
        }}
        controls
      />
    </Box>
  );
};

export default VideoMessage;
