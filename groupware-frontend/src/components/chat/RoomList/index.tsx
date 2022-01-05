import { useAPIGetRoomsByPage } from '@/hooks/api/chat/useAPIGetRoomsByPage';
import { Box, Spinner, Text } from '@chakra-ui/react';
import React, { SetStateAction, useEffect, useState } from 'react';
import { useRoomRefetch } from 'src/contexts/chat/useRoomRefetch';
import { ChatGroup } from 'src/types';
import ChatGroupCard from '../ChatGroupCard';

type RoomListProps = {
  currentId?: string;
  currentRoom?: ChatGroup | undefined;
  setCurrentRoom?: React.Dispatch<SetStateAction<ChatGroup | undefined>>;
  onClickRoom: (room: ChatGroup) => void;
};

const RoomList: React.FC<RoomListProps> = ({
  currentId,
  currentRoom,
  setCurrentRoom,
  onClickRoom,
}) => {
  const { clearRefetch, refetchNeeded } = useRoomRefetch();
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

  const stateRefreshNeeded = (newData: ChatGroup[]) => {
    let updateNeeded = false;
    if (roomsForInfiniteScroll.length !== newData?.length) {
      updateNeeded = true;
    }
    if (roomsForInfiniteScroll.length || newData?.length) {
      for (let i = 0; i < roomsForInfiniteScroll.length; i++) {
        if (updateNeeded) {
          break;
        }
        if (
          new Date(roomsForInfiniteScroll[i]?.updatedAt).getTime() !==
            new Date(newData?.[i]?.updatedAt).getTime() ||
          roomsForInfiniteScroll[i].hasBeenRead !== newData?.[i]?.hasBeenRead ||
          roomsForInfiniteScroll[i]?.members?.length !==
            newData?.[i]?.members?.length
        ) {
          updateNeeded = true;
        }
      }
    }
    if (updateNeeded) {
      setRoomsForInfiniteScroll(newData);
    }
  };

  const { refetch: refreshRooms } = useAPIGetRoomsByPage(
    {
      page: '1',
      limit: (20 * Number(page)).toString(),
    },
    {
      refetchInterval: 30000,
      onSuccess: (data) => {
        stateRefreshNeeded(data.rooms);
        clearRefetch();
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
  }, [currentId, currentRoom, roomsForInfiniteScroll, setCurrentRoom]);

  useEffect(() => {
    if (refetchNeeded) {
      refreshRooms();
      clearRefetch();
    }
  }, [clearRefetch, refetchNeeded, refreshRooms]);

  return (
    <Box
      display={'flex'}
      flexDir="column"
      alignItems="center"
      h="100%"
      overflowY="auto"
      onScroll={onScroll}>
      {roomsForInfiniteScroll.length ? (
        roomsForInfiniteScroll.map((g) => (
          <a
            onClick={() => onClickRoom(g)}
            key={g.id}
            style={{ width: '100%' }}>
            <Box w="100%" mb={'8px'}>
              <ChatGroupCard
                isSelected={Number(currentId) === g.id}
                chatGroup={g}
                key={g.id}
              />
            </Box>
          </a>
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
