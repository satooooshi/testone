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
  const [h, setH] = useState<number>(0);
  const [w, setW] = useState<number>(0);

  useEffect(() => {
    const loadImageDimension = async () => {
      await Image.getSize(message.content, (wi, he) => {
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
        } else if (wi - he > -10 || wi - he < 10) {
          height = 144;
          width = 144;
        } else {
          height = 144;
          width = windowWidth * 0.6;
        }
        setH(height);
        setW(width);
      });
    };
    loadImageDimension();
  }, [message.content, windowWidth]);

  if (h === 0 && w === 0) {
    return <ActivityIndicator />;
  } else {
    return (
      <>
        <TouchableOpacity onPress={onPress} onLongPress={onLongPress}>
          <FastImage
            source={{
              uri: message.content,
              priority: FastImage.priority.low,
            }}
            style={{
              height: h,
              width: w,
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
