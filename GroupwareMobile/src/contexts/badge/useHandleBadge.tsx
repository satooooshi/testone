import React, {useContext, createContext, useState, useEffect} from 'react';
import {io} from 'socket.io-client';
import {useAPIGetRoomsUnreadChatCount} from '../../hooks/api/chat/useAPIGetRoomsUnreadChatCount';
import {ChatGroup} from '../../types';
import {baseURL} from '../../utils/url';
import {useAuthenticate} from '../useAuthenticate';

const BadgeContext = createContext({
  unreadChatCount: 0,
  currentRoom: {} as {id: number; unreadCount: number} | undefined,
  chatGroups: [] as ChatGroup[],
  refetchRoom: () => {},
  refetchGroupId: 0,
  handleEnterRoom: (() => {}) as (roomId: number) => void,
  completeRefetch: () => {},
});

export const BadgeProvider: React.FC = ({children}) => {
  const [chatUnreadCount, setChatUnreadCount] = useState(0);
  const [currentRoom, setCurrentRoom] =
    useState<{id: number; unreadCount: number}>();
  const [chatGroups, setChatGroups] = useState<ChatGroup[]>([]);
  const [refetchGroupId, setRefetchGroupId] = useState(0);
  const {user, currentChatRoomId} = useAuthenticate();
  const socket = io(baseURL, {
    transports: ['websocket'],
  });
  const {mutate: getRooms} = useAPIGetRoomsUnreadChatCount({
    onSuccess: data => {
      let count = 0;
      setChatGroups(data);
      for (const room of data) {
        count += room.unreadCount ? room.unreadCount : 0;
      }
      setChatUnreadCount(count);
    },
  });

  useEffect(() => {
    getRooms();
  }, [user, getRooms]);

  useEffect(
    () => {
      socket.connect();
      socket.on(
        'badgeClient',
        async (data: {userId: number; groupId: number}) => {
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
            setChatUnreadCount(count => count + 1);
            setChatGroups(group =>
              group.map(g => {
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
    [user, currentChatRoomId],
  );

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
        group.map(g => (g.id === roomId ? g : {...g, unreadCount: 0})),
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
      }}>
      {children}
    </BadgeContext.Provider>
  );
};

export const useHandleBadge = () => useContext(BadgeContext);
