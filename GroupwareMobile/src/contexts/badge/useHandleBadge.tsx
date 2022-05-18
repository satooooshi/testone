import React, {useContext, createContext, useState, useEffect} from 'react';
import {Alert} from 'react-native';
import {io} from 'socket.io-client';
import {useAPIGetOneRoom} from '../../hooks/api/chat/useAPIGetOneRoom';
import {useAPIGetRooms} from '../../hooks/api/chat/useAPIGetRoomsByPage';
import {useAPIGetRoomsUnreadChatCount} from '../../hooks/api/chat/useAPIGetRoomsUnreadChatCount';
import {ChatGroup} from '../../types';
import {baseURL} from '../../utils/url';
import {useAuthenticate} from '../useAuthenticate';

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
  const [isNeedRefetch, setIsNeedRefetch] = useState<boolean>(false);

  const {refetch: refetchAllRooms} = useAPIGetRooms(
    {
      page: page.toString(),
      limit: '20',
    },
    {
      enabled: false,
      onSuccess: data => {
        let count = chatUnreadCount;
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

  useEffect(() => {
    refetchAllRooms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isNeedRefetch) {
      refetchAllRooms();
    }
  }, [isNeedRefetch, refetchAllRooms]);

  // const {mutate: getRooms} = useAPIGetRoomsUnreadChatCount({
  //   onSuccess: data => {
  //     let count = 0;
  //     setChatGroups(data);
  //     for (const room of data) {
  //       count += room.unreadCount ? room.unreadCount : 0;
  //     }
  //     setChatUnreadCount(count);
  //   },
  // });

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
        if (pinnedRoomsCount) {
          rooms.splice(pinnedRoomsCount, 0, data);
          setChatGroups(rooms);
        }
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

  // useEffect(() => {
  //   getRooms();
  // }, [user, getRooms]);

  const refetchRoomCard = (roomId: number) => {
    setRefetchGroupId(roomId);
  };

  const handleNewMessage = (groupId: number) => {
    setRefetchGroupId(groupId);
  };

  // useEffect(
  //   () => {
  //     socket.connect();
  //     socket.on(
  //       'badgeClient',
  //       async (data: {userId: number; groupId: number}) => {
  //         // receivedMessage(data);
  //         // debouncedReceiveMessage(data);
  //         console.log(
  //           'message was sent---------==',
  //           data,
  //           user?.id,
  //           currentChatRoomId,
  //         );
  //         if (data?.groupId) {
  //           setRefetchGroupId(data.groupId);
  //         }
  //         if (
  //           user?.id &&
  //           data.userId !== user.id &&
  //           currentChatRoomId !== data.groupId
  //         ) {
  //           setChatUnreadCount(count => count + 1);
  //           setChatGroups(group =>
  //             group.map(g => {
  //               if (g.id === data.groupId) {
  //                 setCurrentRoom({
  //                   id: data.groupId,
  //                   unreadCount: g?.unreadCount ? g.unreadCount + 1 : 1,
  //                 });
  //                 return {
  //                   ...g,
  //                   unreadCount: g?.unreadCount ? g.unreadCount + 1 : 1,
  //                 };
  //               } else {
  //                 return g;
  //               }
  //             }),
  //           );
  //         }
  //       },
  //     );
  //     return () => {
  //       socket.disconnect();
  //     };
  //   }, // eslint-disable-next-line react-hooks/exhaustive-deps
  //   [user, currentChatRoomId],
  // );

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

  // const refetchRoom = () => {
  //   getRooms();
  // };

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
