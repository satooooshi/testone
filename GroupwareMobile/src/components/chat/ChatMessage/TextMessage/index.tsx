import React from 'react';
import {TouchableHighlight, useWindowDimensions} from 'react-native';
import {Div, Text} from 'react-native-magnus';
import {ChatMessage} from '../../../../types';
import {mentionTransform} from '../../../../utils/messageTransform';
import ReplyParent from '../ReplyParent';

export type TextMessageProps = {
  message: ChatMessage;
  onLongPress: () => void;
};

const TextMessage: React.FC<TextMessageProps> = ({message, onLongPress}) => {
  const {width: windowWidth} = useWindowDimensions();
  return (
    <TouchableHighlight onLongPress={onLongPress} underlayColor="none">
      <Div
        rounded="xl"
        maxW={windowWidth * 0.6}
        minW={windowWidth * 0.4}
        bg={message.isSender ? 'blue700' : 'gray400'}
        p={8}
        justifyContent="center">
        {message.replyParentMessage && (
          <ReplyParent parentMessage={message.replyParentMessage} />
        )}
        <Text color={message.isSender ? 'white' : 'black'} fontSize={16}>
          {mentionTransform(message?.content)}
        </Text>
      </Div>
    </TouchableHighlight>
  );
};

export default TextMessage;
