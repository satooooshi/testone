import React from 'react';
import {TouchableHighlight} from 'react-native';
import {Div, Text} from 'react-native-magnus';
import {ChatMessageReaction} from '../../../../types';

type ReactionToMessageProps = {
  onPress: () => void;
  onLongPress: () => void;
  reaction: ChatMessageReaction;
  numbersOfReaction: number;
};

const ReactionToMessage: React.FC<ReactionToMessageProps> = ({
  onPress,
  onLongPress,
  reaction,
  numbersOfReaction,
}) => {
  return (
    <TouchableHighlight
      onPress={onPress}
      onLongPress={onLongPress}
      underlayColor="none">
      <Div
        bg={reaction.isSender ? 'blue600' : undefined}
        flexDir="row"
        borderColor={'#FFFFFF'}
        borderWidth={1}
        p="xs"
        rounded="md">
        <Text fontSize={16}>{reaction.emoji}</Text>
        <Text fontSize={16} color={reaction.isSender ? 'white' : 'black'}>
          {numbersOfReaction}
        </Text>
      </Div>
    </TouchableHighlight>
  );
};

export default ReactionToMessage;
