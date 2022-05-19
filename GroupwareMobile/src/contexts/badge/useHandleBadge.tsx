import React, {useContext, createContext, useState, useEffect} from 'react';
import {Alert} from 'react-native';
import {io} from 'socket.io-client';
import {useAPIGetOneRoom} from '../../hooks/api/chat/useAPIGetOneRoom';
import {useAPIGetRooms} from '../../hooks/api/chat/useAPIGetRoomsByPage';
import {useAPIGetRoomsUnreadChatCount} from '../../hooks/api/chat/useAPIGetRoomsUnreadChatCount';
import {ChatGroup} from '../../types';
import {baseURL} from '../../utils/url';
import {useAuthenticate} from '../useAuthenticate';
import NetInfo, {useNetInfo} from '@react-native-community/netinfo';

const BadgeContext = createContext({
  unreadChatCount: 0,
  currentRoom: {} as {id: number; unreadCount: number} | undefined,
  chatGroups: [] as ChatGroup[],
  setChatGroupsState: (() => {}) as (rooms: ChatGroup[]) => void,
  // refetchRoom: () => {},
  refetchGroupId: 0,
  handleEnterRoom: (() => {}) as (roomId: number) => void,
  refetchRoomCard: (() => {}) as (roomId: number) => void,
  handleNewMessage: (() => {}) as (groupId: number) => void,
  completeRefetch: () => {},
  newRoom: {} as ChatGroup | undefined,
  setNewChatGroup: (() => {}) as (room: ChatGroup | undefined) => void,
});

export const BadgeProvider: React.FC = ({children}) => {
  const [chatUnreadCount, setChatUnreadCount] = useState(0);
  const [currentRoom, setCurrentRoom] =
    useState<{id: number; unreadCount: number}>();
  const [chatGroups, setChatGroups] = useState<ChatGroup[]>([]);
  const [refetchGroupId, setRefetchGroupId] = useState(0);
  const [newMessageGroupId, setNewMessageGroupId] = useState(0);
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
        let count = 0;
        if (chatGroups.length) {
          for (const room of chatGroups) {
            count += room.unreadCount ? room.unreadCount : 0;
          }
        }
        for (const room of data.rooms) {
          count += room.unreadCount ? room.unreadCount : 0;
        }
        setChatUnreadCount(count);
        setChatGroups(r =>
          r.length ? [...r, ...data.rooms] : [...data.rooms],
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

  // useEffect(() => {
  //   refetchAllRooms();
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [user]);

  useEffect(() => {
    Alert.alert(networkConnection ? 'connect' : 'not');
    console.log(networkConnection ? 'connect' : 'not');
    if (networkConnection && user?.id) {
      console.log('refetchAllRooms called ----------------------------');
      refetchAllRooms();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [networkConnection, user]);

  useEffect(() => {
    // Subscribe
    const unsubscribe = NetInfo.addEventListener(state => {
      console.log('Connection type', state.type);
      if (state.isConnected) {
        setNetworkConnection(state.isConnected);
      }
    });

    // Unsubscribe
    return unsubscribe();
  });

  // useEffect(() => {
  //   if (isInternetReachable) {
  //     setNetworkConnection(isInternetReachable);
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [isInternetReachable]);

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
      console.log('0000', user?.lastName, user?.id);

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

  const handleNewMessage = (groupId: number) => {
    setRefetchGroupId(groupId);
  };

  const completeRefetch = () => {
    setRefetchGroupId(0);
  };

  const handleEnterRoom = (roomId: number) => {
    const targetRoom = chatGroups.filter(g => g.id === roomId);
    setCurrentRoom({id: targetRoom[0].id, unreadCount: 0});
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
        currentRoom,
        // refetchRoom,
        refetchGroupId,
        handleEnterRoom,
        refetchRoomCard,
        handleNewMessage,
        completeRefetch,
        newRoom,
        setNewChatGroup,
      }}>
      {children}
    </BadgeContext.Provider>
  );
};

export const useHandleBadge = () => useContext(BadgeContext);
