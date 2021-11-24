import React from 'react';
import {TouchableOpacity, useWindowDimensions} from 'react-native';
import {Image} from 'react-native-magnus';
import {ChatMessage} from '../../../../types';

type ImageMessageProps = {
  onPress: () => void;
  message: ChatMessage;
  onLongPress: () => void;
};

const ImageMessage: React.FC<ImageMessageProps> = ({
  onPress,
  message,
  onLongPress,
}) => {
  const {width: windowWidth} = useWindowDimensions();
  return (
    <TouchableOpacity onPress={onPress} onLongPress={onLongPress}>
      <Image
        source={{uri: message.content}}
        w={windowWidth * 0.6}
        h={144}
        rounded={'md'}
      />
    </TouchableOpacity>
  );
};

export default ImageMessage;
