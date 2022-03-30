import React, {useContext, createContext, useState, useEffect} from 'react';
import {io} from 'socket.io-client';
import {useAPIGetRooms} from '../../hooks/api/chat/useAPIGetRoomsByPage';
import {baseURL} from '../../utils/url';

const BadgeContext = createContext({
  unreadChatCount: 0,
  refetchRoom: () => {},
});

export const BadgeProvider: React.FC = ({children}) => {
  const [chatUnreadCount, setChatUnreadCount] = useState(0);
  const socket = io(baseURL, {
    transports: ['websocket'],
  });
  const {refetch: refetchAllRooms} = useAPIGetRooms(
    {
      page: '1',
    },
    {
      onSuccess: data => {
        let count = 0;
        for (const room of data.rooms) {
          count += room.unreadCount ? room.unreadCount : 0;
        }
        setChatUnreadCount(count);
      },
    },
  );

  useEffect(
    () => {
      socket.on('badgeClient', async (status: string) => {
        if (status !== 'connected') {
          refetchAllRooms();
        }
      });
    }, // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const refetchRoom = () => {
    refetchAllRooms();
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
