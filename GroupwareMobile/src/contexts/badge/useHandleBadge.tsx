import React, {useContext, createContext, useState, useEffect} from 'react';
import {Alert} from 'react-native';
import {useAPIGetOneRoom} from '../../hooks/api/chat/useAPIGetOneRoom';
import {useAPIGetRooms} from '../../hooks/api/chat/useAPIGetRoomsByPage';
import {ChatGroup} from '../../types';
import {useAuthenticate} from '../useAuthenticate';
import NetInfo from '@react-native-community/netinfo';
import {storage} from '../../utils/url';

const BadgeContext = createContext({
  unreadChatCount: 0,
  chatGroups: [] as ChatGroup[],
  setChatGroupsState: (() => {}) as (rooms: ChatGroup[]) => void,
  handleEnterRoom: (() => {}) as (roomId: number) => void,
  refetchRoomCard: (() => {}) as (roomId: number) => void,
  editChatGroup: (() => {}) as (room: ChatGroup) => void,
  isRoomsRefetching: false,
});

export const BadgeProvider: React.FC = ({children}) => {
  const [chatUnreadCount, setChatUnreadCount] = useState(0);
  const [chatGroups, setChatGroups] = useState<ChatGroup[]>([]);
  const [refetchGroupId, setRefetchGroupId] = useState(0);
  const {user, currentChatRoomId} = useAuthenticate();
  const [page, setPage] = useState(1);
  const [isNeedRefetch, setIsNeedRefetch] = useState(false);
  const [completeRefetch, setCompleteRefetch] = useState(false);
  const [networkConnection, setNetworkConnection] = useState(true);
  const [editRoom, setEditRoom] = useState<ChatGroup>();

  const {refetch: refetchAllRooms, isLoading} = useAPIGetRooms(
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
      const jsonRoomListInStorage = storage.getString(
        `chatRoomList${user?.id}`,
      );
      if (jsonRoomListInStorage) {
        const messagesInStorage = JSON.parse(jsonRoomListInStorage);
        setChatGroups(messagesInStorage);
      }
      refetchAllRooms();
    }
    return () => {
      const jsonMessages = JSON.stringify(chatGroups);
      storage.set(`chatRoomList${user?.id}`, jsonMessages);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [networkConnection, user]);

  useEffect(() => {
    if (completeRefetch) {
      const jsonMessages = JSON.stringify(chatGroups);
      storage.set(`chatRoomList${user?.id}`, jsonMessages);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [completeRefetch]);

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
      console.log('----getOneRoom --');

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

  const editChatGroup = (room: ChatGroup) => {
    setEditRoom(room);
  };

  // useEffect(
  //   () => {
  //     if (completeRefetch && chatGroups.length) {
  //       socket.emit(
  //         'setChatGroups',
  //         chatGroups.map(g => g.id),
  //       );
  //       socket.on('editRoomClient', async (room: ChatGroup) => {
  //         if (room?.id) {
  //           setEditRoom(room);
  //         }
  //       });
  //       socket.on(
  //         'badgeClient',
  //         async (data: {userId: number; groupId: number}) => {
  //           if (data.groupId) {
  //             setRefetchGroupId(data.groupId);
  //           }
  //         },
  //       );
  //       setCompleteRefetch(false);
  //     }
  //   }, // eslint-disable-next-line react-hooks/exhaustive-deps
  //   [completeRefetch],
  // );

  // useEffect(
  //   () => {
  //     socket.connect();
  //     return () => {
  //       socket.off('editRoomClient');
  //       socket.off('badgeClient');
  //       socket.disconnect();
  //     };
  //   }, // eslint-disable-next-line react-hooks/exhaustive-deps
  //   [user?.id],
  // );

  useEffect(() => {
    if (editRoom) {
      console.log('editROom called-----', editRoom.members);
      if (editRoom.updatedAt > editRoom.createdAt) {
        if (editRoom.members?.filter(m => m.id === user?.id).length) {
          setChatGroups(room =>
            room.map(r =>
              r.id === editRoom.id
                ? {
                    ...r,
                    name: editRoom.name,
                    members: editRoom.members,
                    muteUsers: editRoom.muteUsers,
                  }
                : r,
            ),
          );
        } else {
          setChatGroups(rooms => rooms.filter(r => r.id !== editRoom.id));
        }
      } else if (editRoom.members?.filter(m => m.id === user?.id).length) {
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
        handleEnterRoom,
        refetchRoomCard,
        editChatGroup,
        isRoomsRefetching: isLoading,
      }}>
      {children}
    </BadgeContext.Provider>
  );
};

export const useHandleBadge = () => useContext(BadgeContext);
