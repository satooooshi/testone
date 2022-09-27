import React, {useEffect, useState} from 'react';
import {
  TouchableOpacity,
  useWindowDimensions,
  Image as RNImage,
} from 'react-native';
import {Icon, Image} from 'react-native-magnus';
import {ChatMessage} from '../../../../types';
import {blueColor} from '../../../../utils/colors';
import {getThumbnailOfVideo} from '../../../../utils/getThumbnailOfVideo';
import {ActivityIndicator} from 'react-native';

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
  const [h, setH] = useState<number>(0);
  const [w, setW] = useState<number>(0);

  useEffect(() => {
    const getThumbnail = async () => {
      message.thumbnail = await getThumbnailOfVideo(
        message.content,
        message.fileName,
      );
      console.log('image sizes,', message.thumbnail);
      RNImage.getSize(message.thumbnail, (wi, he) => {
        let height = 0,
          width = 0;
        if (wi < he && 3 * wi < he) {
          height = windowWidth * 0.6;
          width = 72;
        } else if (wi < he) {
          height = windowWidth * 0.6;
          width = 144;
        } else if (he < wi && 3 * he < wi) {
          height = 72;
          width = windowWidth * 0.6;
        } else if (he < wi) {
          height = 144;
          width = windowWidth * 0.6;
        }
        console.log('image sizes,', height, width);
        setH(height);
        setW(width);
      });
    };
    if (!message.thumbnail) {
      getThumbnail();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [message.thumbnail]);

  if (h === 0 && w === 0) {
    return <ActivityIndicator />;
  } else {
    return (
      <TouchableOpacity onPress={onPress} onLongPress={onLongPress}>
        <Image
          source={{uri: message.thumbnail ? message.thumbnail : undefined}}
          //w={windowWidth * 0.6}
          //h={144}
          w={w}
          h={h}
          rounded={'md'}
        />
        <Icon
          name="play"
          color={blueColor}
          fontSize={48}
          position="absolute"
          left={0}
          right={0}
          top={0}
          bottom={0}
        />
      </TouchableOpacity>
    );
  }
};

export default VideoMessage;
