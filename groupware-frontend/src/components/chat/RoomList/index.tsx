import { useAPIGetRoomsByPage } from '@/hooks/api/chat/useAPIGetRoomsByPage';
import { Box, Link, Spinner, Text } from '@chakra-ui/react';
import React, { SetStateAction, useEffect, useState } from 'react';
import { ChatGroup } from 'src/types';
import ChatGroupCard from '../ChatGroupCard';

type RoomListProps = {
  currentId?: string;
  currentRoom: ChatGroup | undefined;
  setCurrentRoom?: React.Dispatch<SetStateAction<ChatGroup | undefined>>;
  onClickRoom: (room: ChatGroup) => void;
};

const RoomList: React.FC<RoomListProps> = ({
  currentId,
  currentRoom,
  setCurrentRoom,
  onClickRoom,
}) => {
  const [page, setPage] = useState('1');
  const [roomsForInfiniteScroll, setRoomsForInfiniteScroll] = useState<
    ChatGroup[]
  >([]);
  const { data: chatRooms, isLoading: loadingGetChatGroupList } =
    useAPIGetRoomsByPage(
      {
        page,
      },
      {
        onSuccess: (data) => {
          if (data.rooms.length) {
            setRoomsForInfiniteScroll((r) => [...r, ...data.rooms]);
          }
        },
      },
    );
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
  useAPIGetRoomsByPage(
    {
      page: '1',
      limit: (20 * Number(page)).toString(),
    },
    {
      refetchInterval: 3000,
      onSuccess: (data) => {
        setRoomsForInfiniteScroll(data.rooms);
      },
    },
  );

  useEffect(() => {
    if (!currentRoom || currentRoom?.id.toString() !== currentId) {
      const matchedRoom = roomsForInfiniteScroll?.filter(
        (r) => r.id.toString() === currentId,
      );
      if (matchedRoom.length && setCurrentRoom) {
        setCurrentRoom(matchedRoom[0]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentId, currentRoom, setCurrentRoom]);

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
