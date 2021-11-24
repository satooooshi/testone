import React from 'react';
import {TouchableHighlight, useWindowDimensions} from 'react-native';
import {Div, Text} from 'react-native-magnus';
import {ChatMessage} from '../../../../types';
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
        w={windowWidth * 0.6}
        bg="blue700"
        px={8}
        py={8}
        mb={'sm'}
        justifyContent="center">
        {message.replyParentMessage && (
          <ReplyParent parentMessage={message.replyParentMessage} />
        )}
        <Text color="white" fontSize={16}>
          {message?.content}
        </Text>
      </Div>
    </TouchableHighlight>
  );
};

export default TextMessage;
