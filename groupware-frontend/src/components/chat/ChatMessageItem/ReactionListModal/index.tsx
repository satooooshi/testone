import UserAvatar from '@/components/common/UserAvatar';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  Box,
  ModalCloseButton,
  ModalBody,
  Link,
  Text,
} from '@chakra-ui/react';
import React, { useState } from 'react';
import { ChatMessageReaction } from 'src/types';
import { darkFontColor } from 'src/utils/colors';
import { userNameFactory } from 'src/utils/factory/userNameFactory';
import { reactionEmojis } from 'src/utils/reactionEmojis';

type ReactionListModalProps = {
  reactions: ChatMessageReaction[];
  isOpen: boolean;
  onClose: () => void;
};

const ReactionListModal: React.FC<ReactionListModalProps> = ({
  reactions,
  isOpen,
  onClose,
}) => {
  const [selectedEmoji, setSelectedEmoji] = useState<string>(reactionEmojis[0]);
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent h="90vh" bg={'#f9fafb'}>
        <ModalHeader>
          <Box flexDir="row" display="flex" flexWrap="wrap">
            {reactionEmojis.map((e) => (
              <Box
                onClick={() => setSelectedEmoji(e)}
                key={e}
                cursor="pointer"
                px={2}
                borderBottomColor={selectedEmoji === e ? 'blue.500' : undefined}
                borderBottomWidth={selectedEmoji === e ? 1 : undefined}>
                <Text fontSize={32}>{e}</Text>
              </Box>
            ))}
          </Box>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {reactions
            ?.filter((r) => r.emoji === selectedEmoji)
            .map((r) => (
              <Link
                key={r.user?.id}
                display="flex"
                flexDir="row"
                borderBottom={'1px'}
                py="8px"
                alignItems="center"
                justifyContent="space-between"
                href={`/account/${r.user?.id}`}
                passHref>
                <Box display="flex" flexDir="row" alignItems="center">
                  <UserAvatar user={r.user} />
                  <Text fontSize={darkFontColor}>
                    {userNameFactory(r.user)}
                  </Text>
                </Box>
              </Link>
            ))}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default ReactionListModal;
