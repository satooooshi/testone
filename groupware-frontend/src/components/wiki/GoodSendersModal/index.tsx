import UserAvatar from '@/components/common/UserAvatar';
import { useAPIGetGoodsForBoard } from '@/hooks/api/wiki/useAPIGetGoodsForBoard';
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
import { useEffect } from 'react';
import { darkFontColor } from 'src/utils/colors';
import { userNameFactory } from 'src/utils/factory/userNameFactory';

type GoodSendersModalProps = {
  isOpen: boolean;
  onClose: () => void;
  wikiID: number;
};

const GoodSendersModal: React.FC<GoodSendersModalProps> = ({
  isOpen,
  onClose,
  wikiID,
}) => {
  const { mutate: getGoodForBoard, data, isLoading } = useAPIGetGoodsForBoard();
  useEffect(() => {
    getGoodForBoard(wikiID);
  }, [wikiID, getGoodForBoard]);
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
          {data?.map((u) => (
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
