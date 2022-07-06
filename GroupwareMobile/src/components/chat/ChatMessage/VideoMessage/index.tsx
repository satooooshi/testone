import React, {useEffect} from 'react';
import {TouchableOpacity, useWindowDimensions} from 'react-native';
import {Icon, Image} from 'react-native-magnus';
import {ChatMessage} from '../../../../types';
import {blueColor} from '../../../../utils/colors';
import {getThumbnailOfVideo} from '../../../../utils/getThumbnailOfVideo';

type VideMessageProps = {
  message: ChatMessage;
  onPress: () => void;
  onLongPress: () => void;
};

const VideoMessage: React.FC<VideMessageProps> = ({
  onPress,
  message,
  onLongPress,
}) => {
  const {width: windowWidth} = useWindowDimensions();

  useEffect(() => {
    const getThumbnail = async () => {
      message.thumbnail = await getThumbnailOfVideo(
        message.content,
        message.fileName,
      );
    };
    if (!message.thumbnail) {
      getThumbnail();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [message.thumbnail]);

  return (
    <TouchableOpacity onPress={onPress} onLongPress={onLongPress}>
      <Image
        source={{uri: message.thumbnail ? message.thumbnail : undefined}}
        w={windowWidth * 0.6}
        h={144}
        rounded={'md'}
      />
      <Icon
        name="play"
        color={blueColor}
        fontSize={48}
        position="absolute"
        left={windowWidth * 0.25}
        top={0}
        bottom={0}
      />
    </TouchableOpacity>
  );
};

export default VideoMessage;
