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
import { UserGoodForBoard } from 'src/types';
import { darkFontColor } from 'src/utils/colors';
import { userNameFactory } from 'src/utils/factory/userNameFactory';

type GoodSendersModalProps = {
  isOpen: boolean;
  onClose: () => void;
  goodsForBoard: UserGoodForBoard[];
};

const GoodSendersModal: React.FC<GoodSendersModalProps> = ({
  isOpen,
  onClose,
  goodsForBoard,
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
          {goodsForBoard?.map((u) => (
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
                <UserAvatar user={u.user} />
                <Text fontSize={darkFontColor}>{userNameFactory(u.user)}</Text>
              </Box>
            </Link>
          ))}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default GoodSendersModal;
