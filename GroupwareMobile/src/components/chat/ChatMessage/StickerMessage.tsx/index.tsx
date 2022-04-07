import React from 'react';
import {TouchableOpacity, useWindowDimensions} from 'react-native';
import FastImage from 'react-native-fast-image';
import {ChatMessage} from '../../../../types';
import {reactionStickers} from '../../../../utils/factory/reactionStickers';

type StickerMessageProps = {
  message: ChatMessage;
};

const StickerMessage: React.FC<StickerMessageProps> = ({message}) => {
  const {width: windowWidth} = useWindowDimensions();
  return (
    <TouchableOpacity>
      <FastImage
        source={reactionStickers.find(s => s.name === message.content)?.src}
        style={{height: 144, width: windowWidth * 0.6, borderRadius: 8}}
        resizeMode="contain"
      />
    </TouchableOpacity>
  );
};

export default StickerMessage;
