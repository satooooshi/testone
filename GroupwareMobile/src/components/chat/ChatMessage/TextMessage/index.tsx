import React from 'react';
import {useWindowDimensions} from 'react-native';
import {Div, Text} from 'react-native-magnus';
import {ChatMessage} from '../../../../types';

export type TextMessageProps = {
  message: ChatMessage;
};

const TextMessage: React.FC<TextMessageProps> = ({message}) => {
  const {width: windowWidth} = useWindowDimensions();
  return (
    <Div
      rounded="xl"
      w={windowWidth * 0.6}
      bg="blue700"
      px={8}
      py={8}
      mb={'sm'}
      justifyContent="center">
      <Text color="white" fontSize={16}>
        {message?.content}
      </Text>
    </Div>
  );
};

export default TextMessage;
