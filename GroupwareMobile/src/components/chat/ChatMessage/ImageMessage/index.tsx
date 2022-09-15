import React, {memo, useEffect, useState} from 'react';
import {TouchableOpacity, useWindowDimensions, Image} from 'react-native';
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
  const [he, setHe] = useState<number>(0);
  const [wi, setWi] = useState<number>(0);

  useEffect(() => {
    Image.getSize(message.content, (width, height) => {
      setHe(height);
      setWi(width);
    });
  }, [message]);

  return (
    <>
      <TouchableOpacity onPress={onPress} onLongPress={onLongPress}>
        <FastImage
          source={{
            uri: message.content,
            priority: FastImage.priority.low,
          }}
          style={{
            height: !(wi > he) ? windowWidth * 0.6 : 144,
            width: wi > he ? windowWidth * 0.6 : 144,
            borderRadius: 8,
          }}
          resizeMode={FastImage.resizeMode.cover}
        />
      </TouchableOpacity>
    </>
  );
};

export default memo(ImageMessage, (prev, next) => {
  return prev.message.id === next.message.id;
});
