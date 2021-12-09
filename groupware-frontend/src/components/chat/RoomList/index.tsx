import { useAPIGetRoomsByPage } from '@/hooks/api/chat/useAPIGetRoomsByPage';
import { Box, Link, Spinner, Text } from '@chakra-ui/react';
import React, { SetStateAction, useEffect, useState } from 'react';
import { ChatGroup } from 'src/types';
import ChatGroupCard from '../ChatGroupCard';

type RoomListProps = {
  currentId?: string;
  setCurrentRoom?: React.Dispatch<SetStateAction<ChatGroup | undefined>>;
  onClickRoom: (room: ChatGroup) => void;
};

const RoomList: React.FC<RoomListProps> = ({
  currentId,
  setCurrentRoom,
  onClickRoom,
}) => {
  const [page, setPage] = useState('1');
  const [roomsForInfiniteScroll, setRoomsForInfiniteScroll] = useState<
    ChatGroup[]
  >([]);
  const { data: chatRooms, isLoading: loadingGetChatGroupList } =
    useAPIGetRoomsByPage({
      page,
    });
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
    if (currentId) {
      const currentRoom = roomsForInfiniteScroll?.filter(
        (r) => r.id.toString() === currentId,
      );
      if (currentRoom.length && setCurrentRoom) {
        setCurrentRoom(currentRoom[0]);
      }
    }
  }, [currentId, roomsForInfiniteScroll, setCurrentRoom]);

  useEffect(() => {
    if (chatRooms?.rooms?.length) {
      setRoomsForInfiniteScroll((r) => [...r, ...chatRooms.rooms]);
    }
  }, [chatRooms?.rooms]);

  return (
    <Box
      display={'flex'}
      flexDir="column"
      alignItems="center"
      h="100%"
      overflow="scroll"
      onScroll={onScroll}>
      {roomsForInfiniteScroll.length ? (
        roomsForInfiniteScroll.map((g) => (
          <Link w="100%" onClick={() => onClickRoom(g)} key={g.id} mb={'8px'}>
            <ChatGroupCard
              isSelected={Number(currentId) === g.id}
              chatGroup={g}
              key={g.id}
            />
          </Link>
        ))
      ) : (
        <Box position="absolute" top="auto" bottom="auto">
          <Text>ルームを作成するか、招待をお待ちください</Text>
        </Box>
      )}
      {loadingGetChatGroupList && <Spinner />}
    </Box>
  );
};

export default RoomList;
