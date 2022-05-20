/* eslint-disable @typescript-eslint/no-empty-function */
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

const BadgeContext = createContext({
  unreadChatCount: 0,
  currentRoom: {} as { id: number; unreadCount: number } | undefined,
  chatGroups: [] as ChatGroup[],
  refetchRoom: () => {},
  refetchGroupId: 0,
  handleEnterRoom: (() => {}) as (roomId: number) => void,
  completeRefetch: () => {},
  editRoom: {} as ChatGroup | undefined,
  setNewChatGroup: (() => {}) as (room: ChatGroup | undefined) => void,
});

export const BadgeProvider: React.FC = ({ children }) => {
  const [chatUnreadCount, setChatUnreadCount] = useState(0);
  const [currentRoom, setCurrentRoom] =
    useState<{ id: number; unreadCount: number }>();
  const [page, setPage] = useState(1);
  const [isNeedRefetch, setIsNeedRefetch] = useState(false);
  const [chatGroups, setChatGroups] = useState<ChatGroup[]>([]);
  const [refetchGroupId, setRefetchGroupId] = useState(0);
  const { user, currentChatRoomId } = useAuthenticate();
  const [editRoom, setEditRoom] = useState<ChatGroup>();
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
        }
      },
    },
  );

  useEffect(() => {
    getRooms();
  }, [user, getRooms]);

  useEffect(
    () => {
      socket.connect();
      if (chatGroups.length) {
        socket.emit('setChatGroups', chatGroups);
      }
      socket.on('editRoomClient', async (room: ChatGroup) => {
        console.log('-----------');

        if (room?.id) {
          setEditRoom(room);
        }
      });
      socket.on(
        'badgeClient',
        async (data: { userId: number; groupId: number }) => {
          // receivedMessage(data);
          // debouncedReceiveMessage(data);
          console.log(
            'message was sent---------==',
            data,
            user?.id,
            currentChatRoomId,
          );
          if (data?.groupId) {
            setRefetchGroupId(data.groupId);
          }
          if (
            user?.id &&
            data.userId !== user.id &&
            currentChatRoomId != data.groupId
          ) {
            setChatUnreadCount((count) => count + 1);
            setChatGroups((group) =>
              group.map((g) => {
                if (g.id === data.groupId) {
                  setCurrentRoom({
                    id: data.groupId,
                    unreadCount: g?.unreadCount ? g.unreadCount + 1 : 1,
                  });
                  return {
                    ...g,
                    unreadCount: g?.unreadCount ? g.unreadCount + 1 : 1,
                  };
                } else {
                  return g;
                }
              }),
            );
          }
        },
      );
      return () => {
        socket.disconnect();
      };
    }, // eslint-disable-next-line react-hooks/exhaustive-deps
    [user, currentChatRoomId, chatGroups],
  );

  // useEffect(() => {
  //   if (editRoom) {
  //     if (editRoom.updatedAt > editRoom.createdAt) {
  //       if (editRoom.members?.filter((m) => m.id === user?.id).length) {
  //         setChatGroups((room) =>
  //           room.map((r) => (r.id === editRoom.id ? editRoom : r)),
  //         );
  //       } else {
  //         setChatGroups((rooms) => rooms.filter((r) => r.id !== editRoom.id));
  //       }
  //     } else {
  //       const rooms = chatGroups;
  //       const pinnedRoomsCount = rooms.filter((r) => r.isPinned).length;
  //       rooms.splice(pinnedRoomsCount, 0, editRoom);
  //       setChatGroups(rooms);
  //       setEditRoom(undefined);
  //     }
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [editRoom]);

  const setNewChatGroup = (room: ChatGroup | undefined) => {
    setEditRoom(room);
  };

  const completeRefetch = () => {
    setRefetchGroupId(0);
  };

  const handleEnterRoom = (roomId: number) => {
    const targetRoom = chatGroups.filter((g) => g.id === roomId);
    setCurrentRoom({ id: targetRoom[0].id, unreadCount: 0 });
    const unreadCount = targetRoom[0]?.unreadCount;
    if (unreadCount) {
      setChatUnreadCount((c) => (c - unreadCount >= 0 ? c - unreadCount : 0));
      setChatGroups((group) =>
        group.map((g) => (g.id === roomId ? { ...g, unreadCount: 0 } : g)),
      );
    }
  };

  const refetchRoom = () => {
    getRooms();
  };

  return (
    <BadgeContext.Provider
      value={{
        unreadChatCount: chatUnreadCount,
        chatGroups,
        currentRoom,
        refetchRoom,
        refetchGroupId,
        handleEnterRoom,
        completeRefetch,
        editRoom,
        setNewChatGroup,
      }}>
      <RoomRefetchProvider>{children}</RoomRefetchProvider>
    </BadgeContext.Provider>
  );
};

export const useHandleBadge = () => useContext(BadgeContext);
