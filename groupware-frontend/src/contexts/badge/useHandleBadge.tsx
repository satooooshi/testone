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
import {
  onMessageListener,
  requestForToken,
} from 'src/utils/firebase/getFirebaseToken';

const BadgeContext = createContext({
  unreadChatCount: 0,
  chatGroups: [] as ChatGroup[],
  setChatGroupsState: (() => {}) as (rooms: ChatGroup[]) => void,
  refetchGroupId: 0,
  handleEnterRoom: (() => {}) as (roomId: number) => void,
  editRoom: {} as ChatGroup | undefined,
  editChatGroup: (() => {}) as (room: ChatGroup) => void,
  isRoomsRefetching: false,
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
      limit: '20',
    },
    {
      enabled: false,
      onSuccess: (data) => {
        console.log('refetchAllRooms called ----', data.rooms.length);

        let count = page !== 1 && chatGroups.length ? chatUnreadCount : 0;
        for (const room of data.rooms) {
          count += room.unreadCount ? room.unreadCount : 0;
        }
        setChatUnreadCount(count);
        setChatGroups((r) =>
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

  const { refetch: refetchRoom } = useAPIGetOneRoom(refetchGroupId, {
    enabled: false,
    onError: () => {
      alert('ルーム情報の取得に失敗しました');
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

  const returnUpdatedAtLatest = (): Date => {
    const updatedAtTopRoom = chatGroups[0]?.updatedAt;
    if (chatGroups[0]?.isPinned) {
      const updatedAtExceptPinnedTopRoom = chatGroups.filter(
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
      limit: '20',
      updatedAtLatestRoom: returnUpdatedAtLatest(),
    },
    {
      refetchInterval: 10000,
      onSuccess: (data) => {
        const latestRooms = data.rooms;
        console.log(
          'success latest rooms refech ================================',
          latestRooms.length,
        );
        if (latestRooms.length) {
          setChatGroups((rooms) => {
            const latestPinnedRooms = [];
            for (const latestRoom of latestRooms) {
              const olderRoom = chatGroups.filter(
                (r) => r.id === latestRoom.id,
              )[0];
              const incrementCount =
                (latestRoom?.unreadCount || 0) - (olderRoom?.unreadCount || 0);
              setChatUnreadCount((c) => c + incrementCount);
              if (latestRoom.isPinned) {
                latestPinnedRooms.unshift(latestRoom);
              }
            }

            const ids = latestRooms.map((r) => r.id);
            const existRooms = rooms.filter((r) => !ids.includes(r.id));
            const existPinnedRooms = existRooms.filter((r) => r.isPinned);
            const existExceptPinnedRooms = existRooms.filter(
              (r) => !r.isPinned,
            );

            const latestRoomsExceptPinnedRooms = latestRooms.filter(
              (r) => !r.isPinned,
            );

            return [
              ...latestPinnedRooms,
              ...existPinnedRooms,
              ...latestRoomsExceptPinnedRooms,
              ...existExceptPinnedRooms,
            ];
          });
        }
      },
    },
  );

  useEffect(() => {
    if (user?.id) {
      refetchAllRooms();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

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
    if (editRoom) {
      if (editRoom.updatedAt > editRoom.createdAt) {
        if (editRoom.members?.filter((m) => m.id === user?.id).length) {
          setChatGroups((room) =>
            room.map((r) =>
              r.id === editRoom.id
                ? { ...r, name: editRoom.name, members: editRoom.members }
                : r,
            ),
          );
        } else {
          setChatGroups((rooms) => rooms.filter((r) => r.id !== editRoom.id));
        }
      } else if (editRoom.members?.filter((m) => m.id === user?.id).length) {
        const rooms = chatGroups;
        const pinnedRoomsCount = rooms.filter((r) => r.isPinned).length;
        rooms.splice(pinnedRoomsCount, 0, editRoom);
        setChatGroups(rooms);
        setEditRoom(undefined);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editRoom]);

  const editChatGroup = (room: ChatGroup) => {
    setEditRoom(room);
  };

  const setChatGroupsState = (rooms: ChatGroup[]) => {
    setChatGroups(rooms);
  };

  const handleEnterRoom = (roomId: number) => {
    const targetRoom = chatGroups.filter((g) => g.id === roomId);
    const unreadCount = targetRoom[0]?.unreadCount;
    if (unreadCount) {
      setChatUnreadCount((c) => (c - unreadCount >= 0 ? c - unreadCount : 0));
      setChatGroups((group) =>
        group.map((g) => (g.id === roomId ? { ...g, unreadCount: 0 } : g)),
      );
    }
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
      }}>
      <RoomRefetchProvider>{children}</RoomRefetchProvider>
    </BadgeContext.Provider>
  );
};

export const useHandleBadge = () => useContext(BadgeContext);
