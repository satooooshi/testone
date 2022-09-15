import React, {memo} from 'react';
import {TouchableOpacity, useWindowDimensions} from 'react-native';
import FastImage from 'react-native-fast-image';
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
    <>
      <TouchableOpacity onPress={onPress} onLongPress={onLongPress}>
        <FastImage
          source={{
            uri: message.content,
            priority: FastImage.priority.low,
          }}
          style={{
            height: 144,
            width: windowWidth * 0.6,
            borderRadius: 8,
            //backgroundColor: '#2a4365',
          }}
          resizeMode={FastImage.resizeMode.contain}
        />
      </TouchableOpacity>
    </>
  );
};

export default memo(ImageMessage, (prev, next) => {
  return prev.message.id === next.message.id;
});
