import { useAPIGetOneRoom } from '@/hooks/api/chat/useAPIGetOneRoom';
import { useAPIGetRoomsByPage } from '@/hooks/api/chat/useAPIGetRoomsByPage';
import { Box, Spinner, Text, useFocusEffect } from '@chakra-ui/react';
import React, { useCallback, useEffect, useState } from 'react';
import { useHandleBadge } from 'src/contexts/badge/useHandleBadge';
import { useRoomRefetch } from 'src/contexts/chat/useRoomRefetch';
import { ChatGroup } from 'src/types';
import ChatGroupCard from '../ChatGroupCard';
import { useAPISavePin } from '@/hooks/api/chat/useAPISavePin';

type RoomListProps = {
  currentId?: string;
  onClickRoom: (room: ChatGroup) => void;
};

const RoomList: React.FC<RoomListProps> = ({ currentId, onClickRoom }) => {
  const { clearRefetch } = useRoomRefetch();
  const [page, setPage] = useState('1');
  const { setChatGroupsState, chatGroups } = useHandleBadge();
  const [chatRooms, setChatRooms] = useState<ChatGroup[]>([]);

  const { mutate: savePin } = useAPISavePin({
    onSuccess: (data) => {
      const rooms = chatRooms.filter((r) => r.id !== data.id);
      if (data.isPinned) {
        const pinnedRoomsCount = rooms.filter(
          (r) => r.isPinned && r.updatedAt > data.updatedAt,
        ).length;
        if (pinnedRoomsCount) {
          rooms.splice(pinnedRoomsCount, 0, data);
          setChatGroupsState(rooms);
        }
      } else {
        const pinnedRoomsCount = rooms.filter(
          (r) => r.isPinned || r.updatedAt > data.updatedAt,
        ).length;
        if (pinnedRoomsCount) {
          rooms.splice(pinnedRoomsCount, 0, data);
          setChatGroupsState(rooms);
        }
      }
    },
    onError: () => {
      alert(
        'ピン留めを更新中にエラーが発生しました。\n時間をおいて再実行してください。',
      );
    },
  });

  useEffect(() => {
    setChatRooms(chatGroups);
  }, [chatGroups]);

  const onScroll = (e: any) => {
    if (
      e.target.scrollTop > e.target.scrollHeight / 2 &&
      chatRooms?.length >= Number(page) * 20
    ) {
      setPage((p) => (Number(p) + 1).toString());
    }
  };

  return (
    <Box
      display={'flex'}
      flexDir="column"
      alignItems="center"
      h="100%"
      overflowY="auto"
      onScroll={onScroll}>
      {chatRooms.length ? (
        chatRooms.map((g) => (
          <a
            onClick={() => g.id === Number(currentId) || onClickRoom(g)}
            key={g.id}
            style={{ width: '100%' }}>
            <Box w="100%" mb={'8px'}>
              <ChatGroupCard
                isSelected={Number(currentId) === g.id}
                onPressPinButton={() => {
                  savePin({ ...g, isPinned: !g.isPinned });
                }}
                chatGroup={g}
                key={g.id}
              />
            </Box>
          </a>
        ))
      ) : (
        <Box wordBreak="break-all">
          <Text>ルームを作成するか、招待をお待ちください</Text>
        </Box>
      )}
      {chatRooms.length ? <Spinner /> : null}
    </Box>
  );
};

export default RoomList;
