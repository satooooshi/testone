import { useAPIGetRoomDetail } from '@/hooks/api/chat/useAPIGetRoomDetail';
import { useAPIGetRoomsByPage } from '@/hooks/api/chat/useAPIGetRoomsByPage';
import { Box, Spinner, Text } from '@chakra-ui/react';
import React, { SetStateAction, useEffect, useState } from 'react';
import { useRoomRefetch } from 'src/contexts/chat/useRoomRefetch';
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
  const { clearRefetch, refetchNeeded } = useRoomRefetch();
  const [page, setPage] = useState('1');
  const [roomsForInfiniteScroll, setRoomsForInfiniteScroll] = useState<
    ChatGroup[]
  >([]);
  useAPIGetRoomDetail(Number(currentId), {
    onSuccess: (data) => {
      if (setCurrentRoom) {
        setCurrentRoom(data);
      }
    },
    onError: (err) => {
      if (setCurrentRoom) {
        setCurrentRoom(undefined);
      }
      if (err?.response?.data?.message) {
        alert(err?.response?.data?.message);
      }
    },
  });

  const { data: chatRooms, isLoading: loadingGetChatGroupList } =
    useAPIGetRoomsByPage(
      {
        page,
        limit: '20',
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
      e.target.scrollTop > e.target.scrollHeight / 2 &&
      chatRooms?.rooms?.length
    ) {
      setPage((p) => (Number(p) + 1).toString());
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
      ) : loadingGetChatGroupList ? (
        <Spinner />
      ) : (
        <Box wordBreak="break-all">
          <Text>ルームを作成するか、招待をお待ちください</Text>
        </Box>
      )}
      {roomsForInfiniteScroll.length && loadingGetChatGroupList ? (
        <Spinner />
      ) : null}
    </Box>
  );
};

export default RoomList;
