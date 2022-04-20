import { useAPIGetRoomsByPage } from '@/hooks/api/chat/useAPIGetRoomsByPage';
import { Box, Spinner, Text } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { useHandleBadge } from 'src/contexts/badge/useHandleBadge';
import { useRoomRefetch } from 'src/contexts/chat/useRoomRefetch';
import { ChatGroup } from 'src/types';
import ChatGroupCard from '../ChatGroupCard';

type RoomListProps = {
  currentId?: string;
  onClickRoom: (room: ChatGroup) => void;
};

const RoomList: React.FC<RoomListProps> = ({ currentId, onClickRoom }) => {
  const { clearRefetch, refetchNeeded } = useRoomRefetch();
  const [page, setPage] = useState('1');
  const { unreadChatCount } = useHandleBadge();
  const [roomsForInfiniteScroll, setRoomsForInfiniteScroll] = useState<
    ChatGroup[]
  >([]);

  const onScroll = (e: any) => {
    if (
      e.target.scrollTop > e.target.scrollHeight / 2 &&
      roomsForInfiniteScroll?.length >= Number(page) * 20
    ) {
      setPage((p) => (Number(p) + 1).toString());
    }
  };

  const stateRefreshNeeded = (newData: ChatGroup[]) => {
    setRoomsForInfiniteScroll(newData);
  };

  const { refetch: refreshRooms, isLoading: loadingGetChatGroupList } =
    useAPIGetRoomsByPage(
      {
        page: '1',
        limit: (20 * Number(page)).toString(),
      },
      {
        onSettled: clearRefetch,
        onSuccess: (data) => {
          stateRefreshNeeded(data.rooms);
        },
      },
    );

  useEffect(() => {
    if (refetchNeeded) {
      refreshRooms();
    }
  }, [refetchNeeded, refreshRooms]);

  useEffect(() => {
    refreshRooms();
  }, [unreadChatCount, refreshRooms]);

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
            onClick={() => g.id === Number(currentId) || onClickRoom(g)}
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
