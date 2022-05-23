import React, {useContext, createContext, useState, useEffect} from 'react';
import {Alert} from 'react-native';
import {io} from 'socket.io-client';
import {useAPIGetOneRoom} from '../../hooks/api/chat/useAPIGetOneRoom';
import {useAPIGetRooms} from '../../hooks/api/chat/useAPIGetRoomsByPage';
import {ChatGroup} from '../../types';
import {baseURL} from '../../utils/url';
import {useAuthenticate} from '../useAuthenticate';
import NetInfo from '@react-native-community/netinfo';

const BadgeContext = createContext({
  unreadChatCount: 0,
  chatGroups: [] as ChatGroup[],
  setChatGroupsState: (() => {}) as (rooms: ChatGroup[]) => void,
  refetchGroupId: 0,
  handleEnterRoom: (() => {}) as (roomId: number) => void,
  refetchRoomCard: (() => {}) as (roomId: number) => void,
  emitEditRoom: (() => {}) as (room: ChatGroup) => void,
});

export const BadgeProvider: React.FC = ({children}) => {
  const [chatUnreadCount, setChatUnreadCount] = useState(0);
  const [chatGroups, setChatGroups] = useState<ChatGroup[]>([]);
  const [refetchGroupId, setRefetchGroupId] = useState(0);
  const {user, currentChatRoomId} = useAuthenticate();
  const socket = io(baseURL, {
    transports: ['websocket'],
  });
  const [page, setPage] = useState(1);
  const [isNeedRefetch, setIsNeedRefetch] = useState(false);
  const [completeRefetch, setCompleteRefetch] = useState(false);
  const [networkConnection, setNetworkConnection] = useState(true);
  const [editRoom, setEditRoom] = useState<ChatGroup>();

  const {refetch: refetchAllRooms} = useAPIGetRooms(
    {
      page: page.toString(),
      limit: '20',
    },
    {
      enabled: false,
      onSuccess: data => {
        console.log('refetchAllRooms called ----', data.rooms.length);

        let count = page !== 1 && chatGroups.length ? chatUnreadCount : 0;
        for (const room of data.rooms) {
          count += room.unreadCount ? room.unreadCount : 0;
        }
        setChatUnreadCount(count);
        setChatGroups(r =>
          page !== 1 && r.length ? [...r, ...data.rooms] : [...data.rooms],
        );
        if (data.rooms.length >= 20) {
          setPage(p => p + 1);
          setIsNeedRefetch(true);
        } else {
          setIsNeedRefetch(false);
          setPage(1);
          setCompleteRefetch(true);
        }
      },
    },
  );

  const setChatGroupsState = (rooms: ChatGroup[]) => {
    setChatGroups(rooms);
  };

  useEffect(() => {
    if (networkConnection && user?.id) {
      if (chatGroups.length) {
        console.log('666666666666666666666666');
        socket.emit(
          'unsetChatGroups',
          chatGroups.map(g => g.id),
        );
        socket.off('editRoomClient');
        socket.off('badgeClient');
      }
      refetchAllRooms();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [networkConnection, user]);

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
      async (data: {userId: number; groupId: number}) => {
        if (data.groupId) {
          setRefetchGroupId(data.groupId);
        }
      },
    );
  };

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      if (state.isConnected !== null) {
        setNetworkConnection(state.isConnected);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [networkConnection]);

  useEffect(() => {
    if (isNeedRefetch) {
      setIsNeedRefetch(false);
      refetchAllRooms();
    }
  }, [isNeedRefetch, refetchAllRooms]);

  const {refetch: refetchRoom} = useAPIGetOneRoom(refetchGroupId, {
    enabled: false,
    onError: () => {
      Alert.alert('ルーム情報の取得に失敗しました');
    },
    onSuccess: data => {
      let rooms = chatGroups.filter(r => r.id !== data.id);
      if (chatGroups.length === rooms.length) {
        socket.emit('setChatGroup', data.id);
        console.log('888888888');
        resetSocketOn();
      }
      if (data.isPinned) {
        setChatGroups([...[data], ...rooms]);
      } else {
        const pinnedRoomsCount = rooms.filter(r => r.isPinned).length;
        rooms.splice(pinnedRoomsCount, 0, data);
        setChatGroups(rooms);
      }
      if (data.id !== currentChatRoomId) {
        setChatUnreadCount(count => count + 1);
      }
      setRefetchGroupId(0);
    },
  });

  useEffect(() => {
    if (refetchGroupId) {
      refetchRoom();
    }
  }, [refetchGroupId, refetchRoom]);

  const refetchRoomCard = (roomId: number) => {
    setRefetchGroupId(roomId);
  };

  const handleEnterRoom = (roomId: number) => {
    const targetRoom = chatGroups.filter(g => g.id === roomId);
    // setCurrentRoom({id: targetRoom[0].id, unreadCount: 0});
    const unreadCount = targetRoom[0]?.unreadCount;
    if (unreadCount) {
      setChatUnreadCount(c => (c - unreadCount >= 0 ? c - unreadCount : 0));
      setChatGroups(group =>
        group.map(g => (g.id === roomId ? {...g, unreadCount: 0} : g)),
      );
    }
  };

  const emitEditRoom = (room: ChatGroup) => {
    socket.emit('editRoom', room);
  };

  useEffect(
    () => {
      if (completeRefetch && chatGroups.length) {
        socket.emit(
          'setChatGroups',
          chatGroups.map(g => g.id),
        );
        socket.on('editRoomClient', async (room: ChatGroup) => {
          if (room?.id) {
            setEditRoom(room);
          }
        });
        socket.on(
          'badgeClient',
          async (data: {userId: number; groupId: number}) => {
            if (data.groupId) {
              setRefetchGroupId(data.groupId);
            }
          },
        );
        setCompleteRefetch(false);
      }
    }, // eslint-disable-next-line react-hooks/exhaustive-deps
    [completeRefetch, chatGroups],
  );

  useEffect(
    () => {
      socket.connect();
      return () => {
        socket.off('editRoomClient');
        socket.off('badgeClient');
        socket.disconnect();
      };
    }, // eslint-disable-next-line react-hooks/exhaustive-deps
    [user?.id],
  );

  useEffect(() => {
    if (editRoom) {
      if (editRoom.updatedAt > editRoom.createdAt) {
        if (editRoom.members?.filter(m => m.id === user?.id).length) {
          setChatGroups(room =>
            room.map(r =>
              r.id === editRoom.id
                ? {...r, name: editRoom.name, members: editRoom.members}
                : r,
            ),
          );
        } else {
          socket.emit('unsetChatGroup', editRoom.id);
          resetSocketOn();
          setChatGroups(rooms => rooms.filter(r => r.id !== editRoom.id));
        }
      } else if (editRoom.members?.filter(m => m.id === user?.id).length) {
        socket.emit('setChatGroup', editRoom.id);
        resetSocketOn();
        const rooms = chatGroups;
        const pinnedRoomsCount = rooms.filter(r => r.isPinned).length;
        rooms.splice(pinnedRoomsCount, 0, editRoom);
        setChatGroups(rooms);
        setEditRoom(undefined);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editRoom]);

  return (
    <BadgeContext.Provider
      value={{
        unreadChatCount: chatUnreadCount,
        chatGroups,
        setChatGroupsState,
        refetchGroupId,
        handleEnterRoom,
        refetchRoomCard,
        emitEditRoom,
      }}>
      {children}
    </BadgeContext.Provider>
  );
};

export const useHandleBadge = () => useContext(BadgeContext);
