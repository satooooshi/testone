import React, {useMemo} from 'react';
import {TouchableHighlight} from 'react-native';
import {Div, Icon, Text} from 'react-native-magnus';
import {ChatMessage} from '../../../../types';

export type CallMessageProps = {
  message: ChatMessage;
  onLongPress: () => void;
};

const CallMessage: React.FC<CallMessageProps> = ({message, onLongPress}) => {
  const messageContent = useMemo(() => {
    if (message.content !== '音声通話' && !message.isSender) {
      return (message.content = '不在着信');
    }
    return message.content;
  }, [message]);

  return (
    <TouchableHighlight onLongPress={onLongPress} underlayColor="none">
      <Div
        rounded="xl"
        h={60}
        w={150}
        bg={message.isSender ? 'blue600' : 'gray500'}
        p={8}
        flexDir="row"
        alignItems="center">
        <Div
          w={40}
          h={40}
          rounded="circle"
          bg={message.isSender ? 'blue500' : 'gray400'}
          alignItems="center"
          justifyContent="center"
          ml={3}>
          <Icon name="phone" fontFamily="Entypo" fontSize={25} color="white" />
        </Div>
        <Div ml={10} flexDir="column" alignItems="center">
          <Text fontSize={15} color="white">
            {messageContent}
          </Text>
          {message.callTime ? (
            <Text mt={2} fontSize={12} color="white">
              {message.callTime}
            </Text>
          ) : null}
        </Div>
      </Div>
    </TouchableHighlight>
  );
};

export default CallMessage;
