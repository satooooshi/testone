import { useAPISaveChatGroup } from '@/hooks/api/chat/useAPISaveChatGroup';
import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalOverlay,
} from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { useRoomRefetch } from 'src/contexts/chat/useRoomRefetch';
import { User } from 'src/types';
import CreateChatGroupModal from '../CreateChatGroupModal';
import EditChatGroupMembersModal from '../EditChatGroupMembersModal';

type ModalSelectRoomTypeProps = {
  isOpen: boolean;
  closeModal: () => void;
};

const ModalSelectRoomType: React.FC<ModalSelectRoomTypeProps> = ({
  isOpen,
  closeModal,
}) => {
  const router = useRouter();
  const { needRefetch } = useRoomRefetch();

  const [isTalkRoom, setIsTalkRoom] = useState<boolean>(false);
  const [isOpenCreateChatGroupModal, setIsOpenCreateChatGroupModal] =
    useState<boolean>(false);
  const [membersModal, setMembersModal] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState<User[]>();
  const { mutate: createGroup } = useAPISaveChatGroup({
    onSuccess: (createdData) => {
      closeModal();
      needRefetch();
      router.push(`/chat/${createdData.id.toString()}`, undefined, {
        shallow: true,
      });
    },
  });

  return (
    <Modal onClose={closeModal} scrollBehavior="inside" isOpen={isOpen}>
      <ModalOverlay />
      <ModalContent h="90vh" bg={'#f9fafb'}>
        <ModalCloseButton />
        <ModalBody>
          <ModalBody>
            <Button
              onClick={() => {
                setIsTalkRoom(true), setMembersModal(true);
              }}>
              トーク
            </Button>
            <Button onClick={() => setMembersModal(true)}>グループ</Button>
          </ModalBody>

          <EditChatGroupMembersModal
            isOpen={membersModal}
            onClose={() => setMembersModal(false)}
            onComplete={(selected) => {
              if (isTalkRoom && selected.length === 1) {
                createGroup({ name: '', members: selected });
                setMembersModal(false);
              } else {
                setSelectedMembers(selected);
                setIsOpenCreateChatGroupModal(true);
              }
            }}
          />
          <CreateChatGroupModal
            isOpen={isOpenCreateChatGroupModal}
            closeModal={() => {
              setIsOpenCreateChatGroupModal(false);
            }}
            onComplete={() => {
              closeModal(), setMembersModal(false);
            }}
            selectedMembers={selectedMembers || []}
          />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default ModalSelectRoomType;
