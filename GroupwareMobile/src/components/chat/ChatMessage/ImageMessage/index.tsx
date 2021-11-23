import React from 'react';
import {TouchableOpacity, useWindowDimensions} from 'react-native';
import {Image} from 'react-native-magnus';
import {ChatMessage} from '../../../../types';

type ImageMessageProps = {
  onPress: () => void;
  message: ChatMessage;
};

const ImageMessage: React.FC<ImageMessageProps> = ({onPress, message}) => {
  const {width: windowWidth} = useWindowDimensions();
  return (
    <TouchableOpacity onPress={onPress}>
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
