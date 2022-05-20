import { useAPIGetOneRoom } from '@/hooks/api/chat/useAPIGetOneRoom';
import { useAPIGetRoomsByPage } from '@/hooks/api/chat/useAPIGetRoomsByPage';
import {
  Box,
  Input,
  InputGroup,
  InputLeftElement,
  Spinner,
  Text,
} from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { useHandleBadge } from 'src/contexts/badge/useHandleBadge';
import { useRoomRefetch } from 'src/contexts/chat/useRoomRefetch';
import { ChatGroup } from 'src/types';
import ChatGroupCard from '../ChatGroupCard';
import { useAPISavePin } from '@/hooks/api/chat/useAPISavePin';
import { AiOutlineSearch } from 'react-icons/ai';
import { nameOfEmptyNameGroup } from 'src/utils/chat/nameOfEmptyNameGroup';

type RoomListProps = {
  currentId?: string;
  onClickRoom: (room: ChatGroup) => void;
};

const RoomList: React.FC<RoomListProps> = ({ currentId, onClickRoom }) => {
  const { clearRefetch, setNewChatGroup, newRoom } = useRoomRefetch();
  const [page, setPage] = useState(1);
  const { completeRefetch, refetchGroupId } = useHandleBadge();
  const [roomsForInfiniteScroll, setRoomsForInfiniteScroll] = useState<
    ChatGroup[]
  >([]);
  const [isNeedRefetch, setIsNeedRefetch] = useState(false);
  const [searchedRooms, setSearchedRooms] = useState<ChatGroup[]>();

  const { refetch: refetchRoom } = useAPIGetOneRoom(refetchGroupId, {
    enabled: false,
    onError: (err) => {
      if (err?.response?.data?.message) {
        alert(err?.response?.data?.message);
      }
    },
    onSuccess: (data) => {
      const rooms = roomsForInfiniteScroll.filter((r) => r.id !== data.id);
      if (data.isPinned) {
        setRoomsForInfiniteScroll([...[data], ...rooms]);
      } else {
        const pinnedRoomsCount = rooms.filter((r) => r.isPinned).length;
        rooms.splice(pinnedRoomsCount, 0, data);
        setRoomsForInfiniteScroll(rooms);
      }
      completeRefetch();
    },
  });

  const { mutate: savePin } = useAPISavePin({
    onSuccess: (data) => {
      const rooms = roomsForInfiniteScroll.filter((r) => r.id !== data.id);
      if (data.isPinned) {
        const pinnedRoomsCount = rooms.filter(
          (r) => r.isPinned && r.updatedAt > data.updatedAt,
        ).length;
        if (pinnedRoomsCount) {
          rooms.splice(pinnedRoomsCount, 0, data);
          setRoomsForInfiniteScroll(rooms);
        }
      } else {
        const pinnedRoomsCount = rooms.filter(
          (r) => r.isPinned || r.updatedAt > data.updatedAt,
        ).length;
        if (pinnedRoomsCount) {
          rooms.splice(pinnedRoomsCount, 0, data);
          setRoomsForInfiniteScroll(rooms);
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
    if (newRoom) {
      if (newRoom.updatedAt > newRoom.createdAt) {
        setRoomsForInfiniteScroll((room) =>
          room.map((r) => (r.id === newRoom.id ? newRoom : r)),
        );
      } else {
        const rooms = roomsForInfiniteScroll;
        const pinnedRoomsCount = rooms.filter((r) => r.isPinned).length;
        rooms.splice(pinnedRoomsCount, 0, newRoom);
        setRoomsForInfiniteScroll(rooms);
        setNewChatGroup(undefined);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newRoom]);

  // const onScroll = (e: any) => {
  //   if (
  //     e.target.scrollTop > e.target.scrollHeight / 2 &&
  //     roomsForInfiniteScroll?.length >= Number(page) * 20
  //   ) {
  //     setPage((p) => (Number(p) + 1).toString());
  //   }
  // };

  // const stateRefreshNeeded = (newData: ChatGroup[]) => {
  //   setRoomsForInfiniteScroll(newData);
  // };

  const { refetch: refreshRooms, isLoading: loadingGetChatGroupList } =
    useAPIGetRoomsByPage(
      {
        page: page.toString(),
        limit: '20',
      },
      {
        enabled: false,
        onSettled: clearRefetch,
        onSuccess: (data) => {
          setRoomsForInfiniteScroll((r) =>
            page !== 1 && r.length ? [...r, ...data.rooms] : [...data.rooms],
          );
          if (data.rooms.length >= 20) {
            setPage((p) => p + 1);
            setIsNeedRefetch(true);
          } else {
            setIsNeedRefetch(false);
            setPage(1);
          }
        },
      },
    );

  useEffect(() => {
    console.log('first rendering -----------------------');
    refreshRooms();
  }, []);

  useEffect(() => {
    if (isNeedRefetch) {
      refreshRooms();
    }
  }, [isNeedRefetch, refreshRooms]);

  useEffect(() => {
    if (refetchGroupId) {
      refetchRoom();
    }
  }, [refetchGroupId, refetchRoom]);

  return (
    <Box
      display={'flex'}
      flexDir="column"
      alignItems="center"
      h="100%"
      overflowY="auto">
      <InputGroup>
        <InputLeftElement pointerEvents="none">
          <AiOutlineSearch />
        </InputLeftElement>
        <Input
          type="search"
          placeholder="名前で検索"
          onChange={(e) => {
            const filteredRooms = roomsForInfiniteScroll.filter((r) => {
              const regex = new RegExp(e.target.value);
              return r.name
                ? regex.test(r.name)
                : regex.test(nameOfEmptyNameGroup(r.members));
            });
            setSearchedRooms(filteredRooms);
          }}
        />
      </InputGroup>
      {roomsForInfiniteScroll.length ? (
        searchedRooms ? (
          searchedRooms.map((g) => (
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
          roomsForInfiniteScroll.map((g) => (
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
        )
      ) : loadingGetChatGroupList ? (
        <Spinner />
      ) : (
        <Box wordBreak="break-all">
          <Text>ルームを作成するか、招待をお待ちください</Text>
        </Box>
      )}
      {roomsForInfiniteScroll.length && loadingGetChatGroupList ? (
        <Box>
          ただいま全てのルームを取得しています。{'\n'}
          しばらくの間お待ちください
          <Spinner />
        </Box>
      ) : null}
    </Box>
  );
};

export default RoomList;
