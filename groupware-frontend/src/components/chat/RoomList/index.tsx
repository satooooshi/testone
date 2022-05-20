import { useAPIGetOneRoom } from '@/hooks/api/chat/useAPIGetOneRoom';
import { useAPIGetRoomsByPage } from '@/hooks/api/chat/useAPIGetRoomsByPage';
import {
  Box,
  InputGroup,
  InputLeftElement,
  Spinner,
  Text,
  Input,
} from '@chakra-ui/react';
import React, { useCallback, useEffect, useState } from 'react';
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
  const { clearRefetch } = useRoomRefetch();
  const { setChatGroupsState, chatGroups } = useHandleBadge();
  const [chatRooms, setChatRooms] = useState<ChatGroup[]>([]);
  const [searchedRooms, setSearchedRooms] = useState<ChatGroup[]>([]);

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
            const filteredRooms = chatRooms.filter((r) => {
              const regex = new RegExp(e.target.value);
              return r.name
                ? regex.test(r.name)
                : regex.test(nameOfEmptyNameGroup(r.members));
            });
            setSearchedRooms(filteredRooms);
          }}
        />
      </InputGroup>
      {chatRooms.length ? (
        searchedRooms.length ? (
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
        )
      ) : (
        <Box wordBreak="break-all">
          <Text>ルームを作成するか、招待をお待ちください</Text>
        </Box>
      )}
    </Box>
  );
};

export default RoomList;
