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
        <ModalBody overflow={'scroll'}>
          {[...Array(30)]?.map(() => (
            <Link
              key={goodSenders[0]?.id}
              display="flex"
              flexDir="row"
              borderBottom={'1px'}
              py="8px"
              alignItems="center"
              justifyContent="space-between"
              href={`/account/${goodSenders[0]?.id}`}
              passHref>
              <Box display="flex" flexDir="row" alignItems="center">
                <UserAvatar user={goodSenders[0]} />
                <Text fontSize={darkFontColor}>
                  {userNameFactory(goodSenders[0])}
                </Text>
              </Box>
            </Link>
          ))}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default GoodSendersModal;
