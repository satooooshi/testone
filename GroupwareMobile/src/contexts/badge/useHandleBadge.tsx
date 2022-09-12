import React, {useContext, createContext, useState, useEffect} from 'react';
import {Alert} from 'react-native';
import {useAPIGetOneRoom} from '../../hooks/api/chat/useAPIGetOneRoom';
import {useAPIGetRooms} from '../../hooks/api/chat/useAPIGetRoomsByPage';
import {ChatGroup} from '../../types';
import {useAuthenticate} from '../useAuthenticate';
import NetInfo from '@react-native-community/netinfo';
import {storage} from '../../utils/url';
import {socket} from '../../utils/socket';

const BadgeContext = createContext({
  unreadChatCount: 0,
  chatGroups: [] as ChatGroup[],
  setChatGroupsState: (() => {}) as (rooms: ChatGroup[]) => void,
  handleEnterRoom: (() => {}) as (roomId: number) => void,
  refetchRoomCard: (() => {}) as (data: {id: number; type: string}) => void,
  editChatGroup: (() => {}) as (room: ChatGroup) => void,
  refreshRooms: () => {},
  isRoomsRefetching: false,
  isCompletedRefetchAllRooms: false,
});

export const BadgeProvider: React.FC = ({children}) => {
  const [chatUnreadCount, setChatUnreadCount] = useState(0);
  const [chatGroups, setChatGroups] = useState<ChatGroup[]>([]);
  const [refetchGroup, setRefetchGroup] = useState({
    id: 0,
    type: '',
  });
  const {user, currentChatRoomId} = useAuthenticate();
  const [page, setPage] = useState(1);
  const [isNeedRefetch, setIsNeedRefetch] = useState(false);
  const [completeRefetch, setCompleteRefetch] = useState(false);
  const [networkConnection, setNetworkConnection] = useState(true);
  const [editRoom, setEditRoom] = useState<ChatGroup>();
  // const [latestRefetchDate, setLatestRefetchDate] = useState<
  //   string | undefined
  // >('');

  const sortRooms = (room: ChatGroup[]) => {
    if (!room.length) {
      return [];
    }
    const pinnedRooms = room
      .filter(r => r.isPinned)
      .sort((a, b) => {
        if (
          (b?.chatMessages?.[0]?.createdAt
            ? b?.chatMessages?.[0]?.createdAt
            : b.createdAt) >
          (a?.chatMessages?.[0]?.createdAt
            ? a?.chatMessages?.[0]?.createdAt
            : a.createdAt)
        ) {
          return 1;
        } else {
          return -1;
        }
      });
    const exceptPinnedRooms = room
      .filter(r => !r.isPinned)
      .sort((a, b) => {
        if (
          (b?.chatMessages?.[0]?.createdAt
            ? b?.chatMessages?.[0]?.createdAt
            : b.createdAt) >
          (a?.chatMessages?.[0]?.createdAt
            ? a?.chatMessages?.[0]?.createdAt
            : a.createdAt)
        ) {
          return 1;
        } else {
          return -1;
        }
      });
    return [...pinnedRooms, ...exceptPinnedRooms];
  };

  const {refetch: refetchAllRooms, isLoading} = useAPIGetRooms(
    {
      page: page.toString(),
      limit: '100',
    },
    {
      enabled: false,
      onSuccess: data => {
        let count = page !== 1 && chatGroups.length ? chatUnreadCount : 0;
        for (const room of data.rooms) {
          count += room.unreadCount ? room.unreadCount : 0;
        }
        setChatUnreadCount(count);
        setChatGroups(r => {
          const rooms =
            page !== 1 && r.length ? [...r, ...data.rooms] : data.rooms;
          if (!data.gotAllRooms) {
            return rooms;
          }
          return sortRooms(rooms);
        });
        if (!data.gotAllRooms) {
          setPage(p => p + 1);
        } else {
          setPage(1);
          setCompleteRefetch(true);
        }
      },
      onError: () => {
        Alert.alert(
          'チャットルームの取得に失敗しました。しばらく経ってもルームを取得できない場合は、アプリを再起動してみて下さい。',
        );
      },
    },
  );

  const setChatGroupsState = (rooms: ChatGroup[]) => {
    setChatGroups(rooms);
  };

  useEffect(() => {
    if (networkConnection && user?.id) {
      // const jsonRoomListInStorage = storage.getString(
      //   `chatRoomList${user?.id}`,
      // );
      // if (jsonRoomListInStorage) {
      //   const messagesInStorage = JSON.parse(jsonRoomListInStorage);
      //   setChatGroups(messagesInStorage);
      //   let count = 0;
      //   for (const room of messagesInStorage) {
      //     count += room.unreadCount ? room.unreadCount : 0;
      //   }
      //   setChatUnreadCount(count);
      // }
      refetchAllRooms();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [networkConnection, user]);

  // useEffect(() => {
  //   if (user?.id && chatGroups.length) {
  //     const jsonMessages = JSON.stringify(chatGroups);
  //     storage.set(`chatRoomList${user?.id}`, jsonMessages);
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [user?.id, chatGroups]);

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
    if (page > 1) {
      refetchAllRooms();
    }
  }, [page, refetchAllRooms]);

  const {refetch: refetchRoom} = useAPIGetOneRoom(refetchGroup.id, {
    enabled: false,
    onError: () => {
      Alert.alert('ルーム情報の取得に失敗しました');
    },
    onSuccess: data => {
      if (refetchGroup.type === 'edit') {
        setEditRoom(data);
        setRefetchGroup({id: 0, type: ''});
      }
      if (!data.members?.filter(m => m.id === user?.id).length) {
        return;
      }
      let rooms = chatGroups.filter(r => {
        if (r.id === data.id) {
          if (refetchGroup.type === 'badge' && currentChatRoomId !== data.id) {
            const preUnreadCount = r.unreadCount ? r.unreadCount : 0;
            const nowUnreadCount = data.unreadCount ? data.unreadCount : 0;
            setChatUnreadCount(
              count => count - preUnreadCount + nowUnreadCount,
            );
          }
        } else {
          return true;
        }
      });
      if (rooms.length === chatGroups.length && refetchGroup.type === 'badge') {
        setChatUnreadCount(count => count + 1);
      }
      if (data.isPinned) {
        setChatGroups([...[data], ...rooms]);
      } else {
        const pinnedRoomsCount = rooms.filter(r => r.isPinned).length;
        rooms.splice(pinnedRoomsCount, 0, data);
        setChatGroups(rooms);
      }
      setRefetchGroup({id: 0, type: ''});
    },
  });

  useEffect(() => {
    if (refetchGroup.id) {
      refetchRoom();
    }
  }, [refetchGroup, refetchRoom]);

  const refetchRoomCard = (data: {id: number; type: string}) => {
    setRefetchGroup(data);
  };

  const handleEnterRoom = (roomId: number) => {
    const targetRoom = chatGroups.filter(g => g.id === Number(roomId));
    // setCurrentRoom({id: targetRoom[0].id, unreadCount: 0});
    const unreadCount = targetRoom[0]?.unreadCount;
    if (unreadCount) {
      setChatUnreadCount(c => (c - unreadCount >= 0 ? c - unreadCount : 0));
      setChatGroups(group =>
        group.map(g => (g.id === Number(roomId) ? {...g, unreadCount: 0} : g)),
      );
    }
  };

  const editChatGroup = (room: ChatGroup) => {
    setEditRoom(room);
  };

  const refreshRooms = () => {
    setCompleteRefetch(false);
    refetchAllRooms();
  };

  useEffect(() => {
    if (editRoom) {
      if (chatGroups.map(g => g.id).includes(editRoom.id)) {
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
          socket.emit('leaveRoom', editRoom.id.toString());
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
        isRoomsRefetching: isLoading && page === 1,
        isCompletedRefetchAllRooms: completeRefetch,
        refreshRooms,
      }}>
      {children}
    </BadgeContext.Provider>
  );
};

export const useHandleBadge = () => useContext(BadgeContext);
