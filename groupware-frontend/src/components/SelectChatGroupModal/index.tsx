import React from 'react';
import ReactModal from 'react-modal';
import { ChatGroup, ChatMessage } from 'src/types';
import selectChatGroupModalStyles from '@/styles/components/SelectChatGroupModal.module.scss';
import { Button } from '@chakra-ui/react';
import ChatGroupCard from '../ChatGroupCard';

type SelectChatGroupModal = {
  isOpen: boolean;
  chatGroups: ChatGroup[];
  selectedChatGroups: Partial<ChatMessage>;
  toggleChatGroups: (g: ChatGroup) => void;
  onClose: () => void;
};

const SelectChatGroupModal: React.FC<SelectChatGroupModal> = ({
  isOpen,
  chatGroups,
  selectedChatGroups,
  toggleChatGroups,
  onClose,
}) => {
  return (
    <ReactModal
      style={{ overlay: { zIndex: 110 } }}
      ariaHideApp={false}
      isOpen={isOpen}
      className={selectChatGroupModalStyles.modal}>
      <div className={selectChatGroupModalStyles.title_wrapper}>
        <p className={selectChatGroupModalStyles.title}>
          ルームを選択してください
        </p>
      </div>
      <div className={selectChatGroupModalStyles.groups_wrapper}>
        {chatGroups.map((g) => (
          <a
            key={g.id}
            style={{ marginBottom: 10 }}
            onClick={() => toggleChatGroups(g)}>
            <ChatGroupCard
              isSelected={selectedChatGroups.chatGroup?.id === g.id}
              chatGroup={g}
              key={g.id}
            />
          </a>
        ))}
      </div>
      <div className={selectChatGroupModalStyles.modal_bottom_buttons}>
        <Button
          size="md"
          width="140px"
          colorScheme="green"
          borderRadius={5}
          onClick={onClose}>
          閉じる
        </Button>
      </div>
    </ReactModal>
  );
};

export default SelectChatGroupModal;
