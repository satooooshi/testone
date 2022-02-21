import UserAvatar from '@/components/common/UserAvatar';
import {
  Box,
  Link,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
} from '@chakra-ui/react';
import { User } from 'src/types';
import { darkFontColor } from 'src/utils/colors';
import { userNameFactory } from 'src/utils/factory/userNameFactory';

type GoodSendersModalProps = {
  goodSenders: User[];
  isOpen: boolean;
  onClose: () => void;
};

const GoodSendersModal: React.FC<GoodSendersModalProps> = ({
  goodSenders,
  isOpen,
  onClose,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent h="90vh" bg={'#f9fafb'}>
        <ModalHeader>
          <Box flexDir="row" display="flex" flexWrap="wrap">
            いいねしたユーザー
          </Box>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {goodSenders?.map((u) => (
            <Link
              key={u.id}
              display="flex"
              flexDir="row"
              borderBottom={'1px'}
              py="8px"
              alignItems="center"
              justifyContent="space-between"
              href={`/account/${u.id}`}
              passHref>
              <Box display="flex" flexDir="row" alignItems="center">
                {console.log(u)}
                <UserAvatar user={u} />
                <Text fontSize={darkFontColor}>{userNameFactory(u)}</Text>
              </Box>
            </Link>
          ))}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default GoodSendersModal;
