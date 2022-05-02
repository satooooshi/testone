import { Box } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { ChatMessage } from 'src/types';
import { dataURLToVIdeo } from 'src/utils/dataURLToFile';
import ReactPlayer from 'react-player';

type VideoMessageProps = {
  message: ChatMessage;
};

const VideoMessage: React.FC<VideoMessageProps> = ({ message }) => {
  // const [videoFile, setVideoFile] = useState<string>();
  const [videoFile, setVideoFile] = useState<File>();

  useEffect(() => {
    const getUrl = async () => {
      // fetch(message.content).then((data) => {
      //   setVideoFile(data.url);
      // });
      const file = await dataURLToVIdeo(message.content, message.fileName);
      setVideoFile(file);
    };
    if (!videoFile) getUrl();
  });

  useEffect(() => {
    console.log('url', videoFile);
  }, [videoFile]);

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
