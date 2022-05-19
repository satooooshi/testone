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
  completeRefetch: () => {},
  newRoom: {} as ChatGroup | undefined,
  setNewChatGroup: (() => {}) as (room: ChatGroup | undefined) => void,
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
  const [networkConnection, setNetworkConnection] = useState(true);

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
        }
      },
    },
  );

  const setChatGroupsState = (rooms: ChatGroup[]) => {
    setChatGroups(rooms);
  };

  useEffect(() => {
    if (networkConnection && user?.id) {
      console.log('refetchAllRooms called ----------------------------');
      refetchAllRooms();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [networkConnection, user]);

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
      completeRefetch();
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

  const completeRefetch = () => {
    setRefetchGroupId(0);
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

  const [newRoom, setNewRoom] = useState<ChatGroup>();

  const setNewChatGroup = (room: ChatGroup | undefined) => {
    setNewRoom(room);
  };

  useEffect(() => {
    if (newRoom) {
      if (newRoom.updatedAt > newRoom.createdAt) {
        setChatGroups(room =>
          room.map(r => (r.id === newRoom.id ? newRoom : r)),
        );
      } else {
        const rooms = chatGroups;
        const pinnedRoomsCount = rooms.filter(r => r.isPinned).length;
        rooms.splice(pinnedRoomsCount, 0, newRoom);
        setChatGroups(rooms);
        setNewChatGroup(undefined);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newRoom]);

  return (
    <BadgeContext.Provider
      value={{
        unreadChatCount: chatUnreadCount,
        chatGroups,
        setChatGroupsState,
        refetchGroupId,
        handleEnterRoom,
        refetchRoomCard,
        completeRefetch,
        newRoom,
        setNewChatGroup,
      }}>
      {children}
    </BadgeContext.Provider>
  );
};

export const useHandleBadge = () => useContext(BadgeContext);
