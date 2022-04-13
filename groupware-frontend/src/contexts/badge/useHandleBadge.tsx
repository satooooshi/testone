import { useAPIGetRoomsUnreadChatCount } from '@/hooks/api/chat/useAPIGetRoomsUnreadChatCount';
import React, { useContext, createContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { ChatGroup } from '../../types';
import { baseURL } from '../../utils/url';

const BadgeContext = createContext({
  unreadChatCount: 0,
  refetchRoom: () => {},
});

export const BadgeProvider: React.FC = ({ children }) => {
  const [chatUnreadCount, setChatUnreadCount] = useState(0);
  const socket = io(baseURL, {
    transports: ['websocket'],
  });
  const { mutate: getRooms } = useAPIGetRoomsUnreadChatCount({
    onSuccess: (data) => {
      let count = 0;
      for (const room of data) {
        count += room.unreadCount ? room.unreadCount : 0;
      }
      setChatUnreadCount(count);
    },
  });

  useEffect(
    () => {
      socket.on('badgeClient', async (status: string) => {
        if (status !== 'connected') {
          getRooms();
        }
      });
    }, // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const refetchRoom = () => {
    getRooms();
  };

  return (
    <BadgeContext.Provider
      value={{
        unreadChatCount: chatUnreadCount,
        refetchRoom,
      }}>
      {children}
    </BadgeContext.Provider>
  );
};

export const useHandleBadge = () => useContext(BadgeContext);
