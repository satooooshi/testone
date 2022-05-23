/* eslint-disable @typescript-eslint/no-empty-function */
import { useAPIGetRoomsUnreadChatCount } from '@/hooks/api/chat/useAPIGetRoomsUnreadChatCount';
import React, {
  useContext,
  createContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { io } from 'socket.io-client';
import { ChatGroup } from 'src/types';
import { baseURL } from '../../utils/url';
import { useAuthenticate } from '../useAuthenticate';
import { RoomRefetchProvider } from 'src/contexts/chat/useRoomRefetch';
import { useAPIGetRoomsByPage } from '@/hooks/api/chat/useAPIGetRoomsByPage';
import { useAPIGetOneRoom } from '@/hooks/api/chat/useAPIGetOneRoom';

const BadgeContext = createContext({
  unreadChatCount: 0,
  chatGroups: [] as ChatGroup[],
  setChatGroupsState: (() => {}) as (rooms: ChatGroup[]) => void,
  refetchGroupId: 0,
  handleEnterRoom: (() => {}) as (roomId: number) => void,
  editRoom: {} as ChatGroup | undefined,
  setNewChatGroup: (() => {}) as (room: ChatGroup | undefined) => void,
});

export const BadgeProvider: React.FC = ({ children }) => {
  const [chatUnreadCount, setChatUnreadCount] = useState(0);
  const [page, setPage] = useState(1);
  const [isNeedRefetch, setIsNeedRefetch] = useState(false);
  const [chatGroups, setChatGroups] = useState<ChatGroup[]>([]);
  const [refetchGroupId, setRefetchGroupId] = useState(0);
  const { user, currentChatRoomId } = useAuthenticate();
  const [editRoom, setEditRoom] = useState<ChatGroup>();
  const [completeRefetch, setCompleteRefetch] = useState(false);

  const socket = io(baseURL, {
    transports: ['websocket'],
  });
  const { refetch: refetchAllRooms } = useAPIGetRoomsByPage(
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
          setCompleteRefetch(true);
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
      if (chatGroups.length === rooms.length) {
        socket.emit('setChatGroup', data.id);
        resetSocketOn();
      }
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

  const resetSocketOn = () => {
    socket.off('editRoomClient');
    socket.on('editRoomClient', async (room: ChatGroup) => {
      if (room?.id) {
        setEditRoom(room);
        console.log('-----------editRoomClient-----');
      }
    });
    socket.off('badgeClient');
    socket.on(
      'badgeClient',
      async (data: { userId: number; groupId: number }) => {
        if (data.groupId) setRefetchGroupId(data.groupId);
      },
    );
  };

  useEffect(
    () => {
      socket.connect();

      return () => {
        socket.off('editRoomClient');
        socket.off('badgeClient');
        socket.disconnect();
      };
    }, // eslint-disable-next-line react-hooks/exhaustive-deps
    [user, chatGroups],
  );

  useEffect(
    () => {
      if (completeRefetch && chatGroups.length) {
        socket.emit(
          'setChatGroups',
          chatGroups.map((g) => g.id),
        );
        socket.on(
          'badgeClient',
          async (data: { userId: number; groupId: number }) => {
            if (data.groupId) setRefetchGroupId(data.groupId);
          },
        );
        socket.on('editRoomClient', async (room: ChatGroup) => {
          if (room?.id) {
            setEditRoom(room);
            console.log('-----------editRoomClient-----');
          }
        });
        setCompleteRefetch(false);
        console.log('-----====---===---==', chatGroups.length);
      }
    }, // eslint-disable-next-line react-hooks/exhaustive-deps
    [completeRefetch, chatGroups],
  );

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
          socket.emit('unsetChatGroup', editRoom.id);
          resetSocketOn();
          setChatGroups((rooms) => rooms.filter((r) => r.id !== editRoom.id));
        }
      } else {
        socket.emit('setChatGroup', editRoom.id);
        resetSocketOn();
        const rooms = chatGroups;
        const pinnedRoomsCount = rooms.filter((r) => r.isPinned).length;
        rooms.splice(pinnedRoomsCount, 0, editRoom);
        setChatGroups(rooms);
        setEditRoom(undefined);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editRoom]);

  const setNewChatGroup = (room: ChatGroup | undefined) => {
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
        setNewChatGroup,
      }}>
      <RoomRefetchProvider>{children}</RoomRefetchProvider>
    </BadgeContext.Provider>
  );
};

export const useHandleBadge = () => useContext(BadgeContext);
