import { useAPIGetRoomsUnreadChatCount } from '@/hooks/api/chat/useAPIGetRoomsUnreadChatCount';
import React, { useContext, createContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { baseURL } from '../../utils/url';
import { useAuthenticate } from '../useAuthenticate';

const BadgeContext = createContext({
  unreadChatCount: 0,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  refetchRoom: () => {},
});

export const BadgeProvider: React.FC = ({ children }) => {
  const { user } = useAuthenticate();
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
      console.log('count------------------', count);

      setChatUnreadCount(count);
    },
  });

  useEffect(
    () => {
      getRooms();
      socket.on('badgeClient', async (userId: number) => {
        console.log('message was sent---------', userId);
        if (user?.id && userId !== user.id) {
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
