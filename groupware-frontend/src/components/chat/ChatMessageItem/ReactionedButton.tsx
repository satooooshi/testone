import { Button, Text } from '@chakra-ui/react';
import React, { useState } from 'react';
import { useAuthenticate } from 'src/contexts/useAuthenticate';
import { ChatMessageReaction } from 'src/types';
import { numbersOfSameValueInKeyOfObjArr } from 'src/utils/numbersOfSameValueInKeyOfObjArr';

export const ReactionedButton = ({
  reactions,
  reaction,
  onClickReaction,
}: {
  reactions: ChatMessageReaction[];
  reaction: ChatMessageReaction;
  onClickReaction: (reaction: ChatMessageReaction) => void;
}) => {
  return (
    <>
      <Button
        onClick={() => {
          onClickReaction(reaction);
        }}
        bg={reaction.isSender ? 'blue.600' : undefined}
        flexDir="row"
        borderColor={'blue.600'}
        borderWidth={1}
        size="sm">
        <Text fontSize={16}>{reaction.emoji}</Text>
        <Text fontSize={16} color={reaction.isSender ? 'white' : 'blue.600'}>
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
