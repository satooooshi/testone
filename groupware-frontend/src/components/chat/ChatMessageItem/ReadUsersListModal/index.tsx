import UserAvatar from '@/components/common/UserAvatar';
import {
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Link,
  Box,
  Modal,
  Text,
} from '@chakra-ui/react';
import React, { useState } from 'react';
import { User } from 'src/types';
import { darkFontColor } from 'src/utils/colors';
import { userNameFactory } from 'src/utils/factory/userNameFactory';

type ReadUsersListModalProps = {
  usersInRoom: User[];
  readUsers: User[];
  isOpen: boolean;
  onClose: () => void;
};

const ReadUsersListModal: React.FC<ReadUsersListModalProps> = ({
  usersInRoom,
  readUsers,
  isOpen,
  onClose,
}) => {
  const [readOrUnread, setReadOrUnRead] = useState(true);
  const unReadUsers =
    usersInRoom?.filter(
      (r) => usersInRoom?.filter((inRoom) => inRoom.id !== r.id).length,
    ) || [];

  const userRow = (user: User) => (
    <Link
      key={user.id}
      display="flex"
      flexDir="row"
      borderBottom={'1px'}
      py="8px"
      alignItems="center"
      justifyContent="space-between"
      href={`/account/${user?.id}`}
      passHref>
      <Box display="flex" flexDir="row" alignItems="center">
        <UserAvatar user={user} w="40px" h="40px" mr="16px" />
        <Text fontSize={darkFontColor}>{userNameFactory(user)}</Text>
      </Box>
    </Link>
  );
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent h="90vh" bg={'#f9fafb'}>
        <ModalHeader>
          <Box flexDir="row" display="flex">
            <Link
              onClick={() => setReadOrUnRead(true)}
              cursor="pointer"
              display="flex"
              justifyContent="center"
              alignItems="center"
              w="50%"
              pb={'4px'}
              borderBottomColor={readOrUnread ? 'blue.500' : undefined}
              borderBottomWidth={readOrUnread ? 3 : undefined}
              color={readOrUnread ? 'blue.500' : undefined}>
              <Text fontSize={20}>既読</Text>
            </Link>
            <Link
              onClick={() => setReadOrUnRead(false)}
              cursor="pointer"
              pb={'4px'}
              display="flex"
              justifyContent="center"
              alignItems="center"
              w="50%"
              borderBottomColor={!readOrUnread ? 'blue.500' : undefined}
              borderBottomWidth={!readOrUnread ? 3 : undefined}
              color={!readOrUnread ? 'blue.500' : undefined}>
              <Text fontSize={20}>未読</Text>
            </Link>
          </Box>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {readOrUnread
            ? readUsers.map((u) => userRow(u))
            : unReadUsers.map((u) => userRow(u))}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default ReadUsersListModal;
