import React, {memo, useEffect, useState} from 'react';
import {TouchableOpacity, useWindowDimensions, Image} from 'react-native';
import FastImage from 'react-native-fast-image';
import {ChatMessage} from '../../../../types';
import {ActivityIndicator} from 'react-native';

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

  if (he === 0 && wi === 0) {
    return <ActivityIndicator />;
  } else {
    console.log(he, wi);
    let height, width;
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
    return (
      <>
        <TouchableOpacity onPress={onPress} onLongPress={onLongPress}>
          <FastImage
            source={{
              uri: message.content,
              priority: FastImage.priority.low,
            }}
            style={{
              height: height,
              width: width,
              borderRadius: 8,
            }}
            resizeMode={FastImage.resizeMode.cover}
          />
        </TouchableOpacity>
      </>
    );
  }
};

export default memo(ImageMessage, (prev, next) => {
  return prev.message.id === next.message.id;
});
