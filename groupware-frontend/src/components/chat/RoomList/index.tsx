import {
  Box,
  InputGroup,
  InputLeftElement,
  Text,
  Input,
} from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { ChatGroup } from 'src/types';
import ChatGroupCard from '../ChatGroupCard';
import { useAPISavePin } from '@/hooks/api/chat/useAPISavePin';
import { AiOutlineSearch } from 'react-icons/ai';
import { nameOfEmptyNameGroup } from 'src/utils/chat/nameOfEmptyNameGroup';
import { useHandleBadge } from 'src/contexts/badge/useHandleBadge';
import router from 'next/router';
import { useAuthenticate } from 'src/contexts/useAuthenticate';
import { useAPIGetRoomsByPage } from '@/hooks/api/chat/useAPIGetRoomsByPage';
import { sortRooms } from 'src/utils/chat/sortRooms';

type RoomListProps = {
  currentId?: string;
  onClickRoom: (room: ChatGroup) => void;
};

const RoomList: React.FC<RoomListProps> = ({ currentId, onClickRoom }) => {
  const { setChatGroupsState, chatGroups, updateUnreadCount } =
    useHandleBadge();
  const { currentChatRoomId } = useAuthenticate();
  const [chatRooms, setChatRooms] = useState<ChatGroup[]>([]);
  const [searchedRooms, setSearchedRooms] = useState<ChatGroup[] | null>(null);

  const { mutate: savePin } = useAPISavePin({
    onSuccess: (data) => {
      const rooms = chatRooms.filter((r) => r.id !== data.id);
      const pinnedRoomsCount = rooms.filter((r) =>
        data.isPinned
          ? r.isPinned && r.updatedAt > data.updatedAt
          : r.isPinned || r.updatedAt > data.updatedAt,
      ).length;
      rooms.splice(pinnedRoomsCount, 0, data);
      setChatGroupsState(rooms);
    },
    onError: () => {
      alert(
        'ピン留めを更新中にエラーが発生しました。\n時間をおいて再実行してください。',
      );
    },
  });

  const returnUpdatedAtLatest = (): Date => {
    const updatedAtTopRoom = chatRooms[0]?.updatedAt;
    if (chatRooms[0]?.isPinned) {
      const updatedAtExceptPinnedTopRoom = chatRooms.filter(
        (r) => !r.isPinned,
      )[0]?.updatedAt;

      return updatedAtTopRoom > updatedAtExceptPinnedTopRoom
        ? updatedAtTopRoom
        : updatedAtExceptPinnedTopRoom;
    }
    return updatedAtTopRoom;
  };

  const { refetch: refetchLatestRooms } = useAPIGetRoomsByPage(
    {
      limit: '100',
      updatedAtLatestRoom: returnUpdatedAtLatest(),
    },
    {
      refetchInterval: 1000,
      onSuccess: (data) => {
        const latestRooms = data.rooms;
        if (latestRooms.length) {
          for (const latestRoom of latestRooms) {
            if (currentChatRoomId !== latestRoom.id) {
              const olderRoom = chatGroups.filter(
                (r) => r.id === latestRoom.id,
              )[0];
              const incrementCount =
                (latestRoom?.unreadCount || 0) - (olderRoom?.unreadCount || 0);
              updateUnreadCount(incrementCount);
            }
          }
          const ids = latestRooms.map((r) => r.id);
          const existRooms = chatGroups.filter((r) => !ids.includes(r.id));

          setChatGroupsState(sortRooms([...latestRooms, ...existRooms]));
        }
      },
    },
  );

  useEffect(() => {
    setChatRooms(chatGroups);
  }, [chatGroups]);

  return (
    <Box
      display={'flex'}
      flexDir="column"
      alignItems="center"
      h="100%"
      bg="white"
      rounded={10}
      py={3}
      px="3%"
      overflowY="auto">
      <InputGroup mb={3}>
        <InputLeftElement pointerEvents="none">
          <AiOutlineSearch />
        </InputLeftElement>
        <Input
          type="search"
          placeholder="名前で検索"
          onChange={(e) => {
            if (e.target.value === '') {
              setSearchedRooms(null);
              return;
            }
            const filteredRooms = chatRooms.filter((r) => {
              const regex = new RegExp(e.target.value);
              return regex.test(nameOfEmptyNameGroup(r));
            });
            setSearchedRooms(filteredRooms);
          }}
        />
      </InputGroup>
      {chatRooms.length ? (
        (searchedRooms ?? chatRooms).map((g) => (
          <Box
            onClick={() => g.id === Number(currentId) || onClickRoom(g)}
            key={g.id}
            style={{ width: '100%', cursor: 'pointer' }}>
            <Box w="100%" mb={'8px'}>
              <ChatGroupCard
                isSelected={Number(currentId) === g.id}
                onPressPinButton={() => {
                  savePin({ ...g, isPinned: !g.isPinned });
                  g.isPinned = !g.isPinned;
                }}
                chatGroup={g}
                key={g.id}
              />
            </Box>
          </Box>
        ))
      ) : (
        <Box wordBreak="break-all">
          <Text>ルームを作成するか、招待をお待ちください</Text>
        </Box>
      )}
    </Box>
  );
};

export default RoomList;
