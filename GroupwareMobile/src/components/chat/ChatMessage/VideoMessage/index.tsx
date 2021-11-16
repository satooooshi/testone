import React from 'react';
import {TouchableOpacity, useWindowDimensions} from 'react-native';
import {Icon, Image} from 'react-native-magnus';
import {ChatMessage} from '../../../../types';
import {blueColor} from '../../../../utils/colors';

type VideMessageProps = {
  message: ChatMessage;
  onPress: () => void;
};

const VideoMessage: React.FC<VideMessageProps> = ({onPress, message}) => {
  const {width: windowWidth} = useWindowDimensions();
  return (
    <TouchableOpacity onPress={onPress}>
      <Image
        source={{uri: message.thumbnail}}
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
