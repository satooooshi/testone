import React, {useContext, createContext, useState, useEffect} from 'react';
import {io} from 'socket.io-client';
import {useAPIGetRoomsUnreadChatCount} from '../../hooks/api/chat/useAPIGetRoomsUnreadChatCount';
import {ChatGroup} from '../../types';
import {baseURL} from '../../utils/url';
import {useAuthenticate} from '../useAuthenticate';

const BadgeContext = createContext({
  unreadChatCount: 0,
  refetchRoom: () => {},
  refetchGroupId: 0,
  handleEnterRoom: (() => {}) as (roomId: number) => void,
  completeRefetch: () => {},
});

export const BadgeProvider: React.FC = ({children}) => {
  const [chatUnreadCount, setChatUnreadCount] = useState(0);
  const [chatGroups, setChatGroups] = useState<ChatGroup[]>([]);
  const [refetchGroupId, setRefetchGroupId] = useState(0);
  const {user} = useAuthenticate();
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
      console.log('count-----', count);
      setChatUnreadCount(count);
    },
  });

  useEffect(
    () => {
      getRooms();
      socket.on(
        'badgeClient',
        async (data: {userId: number; groupId: number}) => {
          console.log('message was sent---------', data, user);
          if (data?.groupId) {
            setRefetchGroupId(data.groupId);
          }
          if (user?.id && data.userId !== user.id) {
            setChatUnreadCount(count => count + 1);
            setChatGroups(group =>
              group.map(g =>
                g.id === data.groupId
                  ? g
                  : {...g, unreadCount: g?.unreadCount ? g.unreadCount + 1 : 1},
              ),
            );
            // getRooms();
          }
          // handleGetRoom(userId);
        },
      );
    }, // eslint-disable-next-line react-hooks/exhaustive-deps
    [user],
  );

  const completeRefetch = () => {
    setRefetchGroupId(0);
  };

  const handleEnterRoom = (roomId: number) => {
    const targetRoom = chatGroups.filter(g => g.id === roomId);
    const unreadCount = targetRoom[0]?.unreadCount;
    if (unreadCount) {
      setChatUnreadCount(c => c - unreadCount);
      setChatGroups(group =>
        group.map(g => (g.id === roomId ? g : {...g, unreadCount: 0})),
      );
    }
  };
  // const handleGetRoom = useCallback(
  //   (userId: number) => {
  //     console.log('6666');

  //     if (user?.id && userId !== user.id) {
  //       getRooms();
  //     }
  //   },
  //   [user, getRooms],
  // );

  const refetchRoom = () => {
    getRooms();
  };

  return (
    <BadgeContext.Provider
      value={{
        unreadChatCount: chatUnreadCount,
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
