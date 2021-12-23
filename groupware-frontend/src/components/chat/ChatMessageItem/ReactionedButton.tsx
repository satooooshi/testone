import { useAPIDeleteReaction } from '@/hooks/api/chat/useAPIDeleteReaction';
import { useAPISaveReaction } from '@/hooks/api/chat/useAPISaveReaction';
import { Button, Text } from '@chakra-ui/react';
import React, { useState } from 'react';
import { useAuthenticate } from 'src/contexts/useAuthenticate';
import { ChatMessageReaction } from 'src/types';
import { numbersOfSameValueInKeyOfObjArr } from 'src/utils/numbersOfSameValueInKeyOfObjArr';

export const ReactionedButton = ({
  reactions,
  reaction,
}: {
  reactions: ChatMessageReaction[];
  reaction: ChatMessageReaction;
}) => {
  const { user } = useAuthenticate();
  const [count, setCount] = useState(
    numbersOfSameValueInKeyOfObjArr(
      reactions as ChatMessageReaction[],
      reaction,
      'emoji',
    ),
  );
  const [isSender, setIsSender] = useState(reaction.isSender || false);
  const { mutate: saveReaction } = useAPISaveReaction();
  const { mutate: deleteReaction } = useAPIDeleteReaction();

  return (
    <>
      {count ? (
        <Button
          onClick={() => {
            if (user) {
              if (isSender) {
                deleteReaction(
                  { ...reaction, user },
                  {
                    onSuccess: () => {
                      setIsSender(false);
                      setCount((c) => c - 1);
                    },
                  },
                );
              } else {
                saveReaction(
                  { ...reaction, user },
                  {
                    onSuccess: () => {
                      setIsSender(true);
                      setCount((c) => c + 1);
                    },
                  },
                );
              }
            }
          }}
          bg={isSender ? 'blue.600' : undefined}
          flexDir="row"
          borderColor={'blue.600'}
          borderWidth={1}
          size="sm">
          <Text fontSize={16}>{reaction.emoji}</Text>
          <Text fontSize={16} color={isSender ? 'white' : 'blue.600'}>
            {count}
          </Text>
        </Button>
      ) : null}
    </>
  );
};
