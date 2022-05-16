import React, { SetStateAction, useEffect, useMemo, useState } from 'react';
import ReactModal from 'react-modal';
import { ChatGroup } from 'src/types';
import selectChatGroupModalStyles from '@/styles/components/SelectChatGroupModal.module.scss';
import { Box, Button, Spinner, Text } from '@chakra-ui/react';
import ChatGroupCard from '../ChatGroupCard';
import { useAPIGetRoomsByPage } from '@/hooks/api/chat/useAPIGetRoomsByPage';
import { darkFontColor } from 'src/utils/colors';

type SelectChatGroupModal = {
  isOpen: boolean;
  selectedChatGroup: ChatGroup;
  toggleChatGroups: (g: ChatGroup) => void;
  onClose: () => void;
  selectedRoomId: string;
  setCurrentRoom: React.Dispatch<SetStateAction<ChatGroup | undefined>>;
};

const SelectChatGroupModal: React.FC<SelectChatGroupModal> = ({
  isOpen,
  selectedChatGroup,
  toggleChatGroups,
  onClose,
  selectedRoomId,
  setCurrentRoom,
}) => {
  const [page, setPage] = useState('1');
  const { data: chatRooms, isLoading: loadingGetChatGroupList } =
    useAPIGetRoomsByPage({
      page,
    });
  const [roomsForInfiniteScroll, setRoomsForInfiniteScroll] = useState<
    ChatGroup[]
  >([]);
  const focusedGroup = useMemo(() => {
    if (selectedRoomId) {
      return roomsForInfiniteScroll?.filter(
        (g) => g.id.toString() === selectedRoomId,
      );
    }
  }, [selectedRoomId, roomsForInfiniteScroll]);

  const onScroll = (e: any) => {
    if (
      e.target.clientHeight - e.target.scrollTop >=
      (e.target.scrollHeight * 2) / 3
    ) {
      if (
        typeof Number(chatRooms?.pageCount) === 'number' &&
        Number(page + 1) <= Number(chatRooms?.pageCount)
      ) {
        setPage((p) => (Number(p) + 1).toString());
      }
    }
  };

  useEffect(() => {
    if (focusedGroup?.length) {
      setCurrentRoom(focusedGroup[0]);
    }
  }, [focusedGroup, setCurrentRoom]);

  useEffect(() => {
    if (chatRooms?.rooms?.length) {
      setRoomsForInfiniteScroll((r) => [...r, ...chatRooms.rooms]);
    }
  }, [chatRooms?.rooms]);

  return (
    <ReactModal
      style={{ overlay: { zIndex: 110 } }}
      ariaHideApp={false}
      isOpen={isOpen}
      className={selectChatGroupModalStyles.modal}>
      <Box alignSelf="center" mb="8px">
        <Text fontWeight="bold" color={darkFontColor}>
          ルームを選択してください
        </Text>
      </Box>
      <Box
        onScroll={onScroll}
        display="flex"
        flexDir="column"
        alignItems="center"
        mb="16px"
        h="80%"
        overflowY="auto">
        {roomsForInfiniteScroll.map((g) => (
          <a
            key={g.id}
            style={{ marginBottom: 10 }}
            onClick={() => toggleChatGroups(g)}>
            <ChatGroupCard
              isSelected={selectedChatGroup.id === g.id}
              chatGroup={g}
              key={g.id}
              onPressPinButton={() => {
                alert('使用していなかったため、処理なし');
              }}
            />
          </a>
        ))}
        {loadingGetChatGroupList && <Spinner />}
      </Box>
      <Box alignSelf="center" mb="8px">
        <Button
          size="md"
          width="140px"
          colorScheme="green"
          borderRadius={5}
          onClick={onClose}>
          閉じる
        </Button>
      </Box>
    </ReactModal>
  );
};

export default SelectChatGroupModal;
