import { Box, Text } from '@chakra-ui/react';
import React from 'react';
import { ChatMessage } from 'src/types';
import ReactPlayer from 'react-player';

type VideoMessageProps = {
  message: ChatMessage;
};

const VideoMessage: React.FC<VideoMessageProps> = ({ message }) => {
  const userAgent = window.navigator.userAgent;
  const isSafari = userAgent.includes('Safari');
  return (
    <Box display="flex" maxW="300px" maxH={'300px'}>
      {isSafari ? (
        <video controls muted>
          <source
            src={message.content}
            style={{
              maxHeight: '100px',
              maxWidth: '100px',
              objectFit: 'contain',
            }}
            type="video/mp4"
          />
        </video>
      ) : (
        <ReactPlayer
          url={message.content}
          maxW={300}
          maxH={300}
          objectFit={'scale-down'}
          config={{
            file: {
              attributes: {
                controlsList: 'nodownload',
              },
            },
          }}
          controls
        />
      )}
    </Box>
  );
};

export default VideoMessage;
