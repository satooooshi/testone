import { Button, Text } from '@chakra-ui/react';
import React from 'react';
import { ChatMessageReaction } from 'src/types';
import { numbersOfSameValueInKeyOfObjArr } from 'src/utils/numbersOfSameValueInKeyOfObjArr';

export const ReactionedButton = ({
  reactions,
  reaction,
  isSenderInReactions,
  onClickReaction,
}: {
  reactions: ChatMessageReaction[];
  reaction: ChatMessageReaction;
  isSenderInReactions: boolean;
  onClickReaction: (reaction: ChatMessageReaction) => void;
}) => {
  return (
    <>
      <Button
        onClick={() => {
          onClickReaction(reaction);
        }}
        bg={isSenderInReactions ? 'brand.600' : undefined}
        flexDir="row"
        borderColor={'brand.600'}
        borderWidth={1}
        size="xs">
        <Text fontSize={16}>{reaction.emoji}</Text>
        <Text fontSize={16} color={isSenderInReactions ? 'white' : 'brand.600'}>
          {numbersOfSameValueInKeyOfObjArr(
            reactions as ChatMessageReaction[],
            reaction,
            'emoji',
          )}
        </Text>
      </Button>
    </>
  );
};
