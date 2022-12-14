/* eslint-disable @typescript-eslint/no-empty-function */
import { useAPIGetRoomsUnreadChatCount } from '@/hooks/api/chat/useAPIGetRoomsUnreadChatCount';
import React, {
  useContext,
  createContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { ChatGroup } from 'src/types';
import { useAuthenticate } from '../useAuthenticate';
import { RoomRefetchProvider } from 'src/contexts/chat/useRoomRefetch';
import { useAPIGetRoomsByPage } from '@/hooks/api/chat/useAPIGetRoomsByPage';
import { useAPIGetOneRoom } from '@/hooks/api/chat/useAPIGetOneRoom';
import router from 'next/router';
import { useAPISendNotifiForRefetchRoom } from '@/hooks/api/chat/useAPISendNotifiForRefetchRoom';
import { sortRooms } from 'src/utils/chat/sortRooms';

const BadgeContext = createContext({
  unreadChatCount: 0,
  chatGroups: [] as ChatGroup[],
  setChatGroupsState: (() => {}) as (rooms: ChatGroup[]) => void,
  refetchGroupId: 0,
  handleEnterRoom: (() => {}) as (roomId: number) => void,
  editRoom: {} as ChatGroup | undefined,
  editChatGroup: (() => {}) as (room: ChatGroup) => void,
  updateUnreadCount: (() => {}) as (num: number) => void,
  isRoomsRefetching: false,
  getOneRoom: (() => {}) as (roomId: number) => ChatGroup | undefined,
});

export const BadgeProvider: React.FC = ({ children }) => {
  const [chatUnreadCount, setChatUnreadCount] = useState(0);
  const [page, setPage] = useState(1);
  const [isNeedRefetch, setIsNeedRefetch] = useState(false);
  const [chatGroups, setChatGroups] = useState<ChatGroup[]>([]);
  const [refetchGroupId, setRefetchGroupId] = useState(0);
  const { user, currentChatRoomId } = useAuthenticate();
  const [editRoom, setEditRoom] = useState<ChatGroup>();
  const { refetch: refetchAllRooms, isLoading } = useAPIGetRoomsByPage(
    {
      page: page.toString(),
      limit: '100',
    },
    {
      enabled: false,
      onSuccess: (data) => {
        let count = page !== 1 && chatGroups.length ? chatUnreadCount : 0;
        for (const room of data.rooms) {
          count += room.unreadCount ? room.unreadCount : 0;
        }
        setChatUnreadCount(count);
        setChatGroups((r) => {
          const rooms =
            page !== 1 && r.length ? [...r, ...data.rooms] : data.rooms;
          if (!data.gotAllRooms) {
            return rooms;
          }
          return sortRooms(rooms);
        });
        if (!data.gotAllRooms) {
          setPage((p) => p + 1);
          setIsNeedRefetch(true);
        } else {
          setIsNeedRefetch(false);
          setPage(1);
        }
      },
    },
  );

  const { refetch: refetchRoom } = useAPIGetOneRoom(refetchGroupId, {
    enabled: false,
    onError: () => {
      alert('?????????????????????????????????????????????');
    },
    onSuccess: (data) => {
      const rooms = chatGroups.filter((r) => r.id !== data.id);
      if (data.isPinned) {
        setChatGroups([...[data], ...rooms]);
      } else {
        const pinnedRoomsCount = rooms.filter((r) => r.isPinned).length;
        rooms.splice(pinnedRoomsCount, 0, data);
        setChatGroups(rooms);
      }
      if (
        data.id !== currentChatRoomId &&
        data?.chatMessages?.[0].sender !== user?.id
      ) {
        setChatUnreadCount((count) => count + 1);
      }
      setRefetchGroupId(0);
    },
  });

  const { mutate: sendNotifiForRefetch } = useAPISendNotifiForRefetchRoom();

  useEffect(() => {
    if (user?.id) {
      refetchAllRooms();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // useEffect(() => {
  //   console.log('-----', chatGroups.length);
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [chatGroups]);

  useEffect(() => {
    if (isNeedRefetch) {
      setIsNeedRefetch(false);
      refetchAllRooms();
    }
  }, [isNeedRefetch, refetchAllRooms]);

  useEffect(() => {
    if (refetchGroupId) {
      refetchRoom();
    }
  }, [refetchGroupId, refetchRoom]);

  // useEffect(() => {
  //   const handleMessaging = async () => {
  //     await requestForToken();
  //     // onMessageListener();
  //   };
  //   handleMessaging();
  // }, [user]);

  useEffect(() => {
    if (editRoom?.members?.filter((m) => m.id === user?.id).length) {
      if (editRoom.updatedAt > editRoom.createdAt) {
        setChatGroups((room) =>
          room.map((r) =>
            r.id === editRoom.id
              ? { ...r, name: editRoom.name, members: editRoom.members }
              : r,
          ),
        );
      } else if (!chatGroups?.filter((g) => g.id === editRoom.id).length) {
        const rooms = chatGroups;
        const pinnedRoomsCount = rooms.filter((r) => r.isPinned).length;
        rooms.splice(pinnedRoomsCount, 0, editRoom);
        setChatGroups(rooms);
        setEditRoom(undefined);
      }
    } else if (editRoom) {
      setChatGroups((rooms) => rooms.filter((r) => r.id !== editRoom.id));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editRoom]);

  const editChatGroup = (room: ChatGroup) => {
    setEditRoom(room);
  };

  const setChatGroupsState = (rooms: ChatGroup[]) => {
    setChatGroups(rooms);
  };

  const updateUnreadCount = (num: number) => {
    setChatUnreadCount((c) => c + num);
  };

  const handleEnterRoom = (roomId: number) => {
    const targetRoom = chatGroups.filter((g) => g.id === roomId);
    const unreadCount = targetRoom[0]?.unreadCount;
    if (unreadCount) {
      sendNotifiForRefetch(roomId);
      setChatUnreadCount((c) => (c - unreadCount >= 0 ? c - unreadCount : 0));
      setChatGroups((group) =>
        group.map((g) => (g.id === roomId ? { ...g, unreadCount: 0 } : g)),
      );
    }
  };

  const getOneRoom = (roomId: number) => {
    return chatGroups.find((g) => g.id === roomId);
  };

  return (
    <BadgeContext.Provider
      value={{
        unreadChatCount: chatUnreadCount,
        chatGroups,
        setChatGroupsState,
        refetchGroupId,
        handleEnterRoom,
        editRoom,
        editChatGroup,
        isRoomsRefetching: isLoading,
        updateUnreadCount,
        getOneRoom,
      }}>
      <RoomRefetchProvider>{children}</RoomRefetchProvider>
    </BadgeContext.Provider>
  );
};

export const useHandleBadge = () => useContext(BadgeContext);
