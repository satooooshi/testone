import React, {
  useContext,
  createContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import {io} from 'socket.io-client';
import {useAPIGetRoomsUnreadChatCount} from '../../hooks/api/chat/useAPIGetRoomsUnreadChatCount';
import {baseURL} from '../../utils/url';
import {useAuthenticate} from '../useAuthenticate';

const BadgeContext = createContext({
  unreadChatCount: 0,
  refetchRoom: () => {},
});

export const BadgeProvider: React.FC = ({children}) => {
  const [chatUnreadCount, setChatUnreadCount] = useState(0);
  const {user} = useAuthenticate();
  const socket = io(baseURL, {
    transports: ['websocket'],
  });
  const {mutate: getRooms} = useAPIGetRoomsUnreadChatCount({
    onSuccess: data => {
      let count = 0;
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
      socket.on('badgeClient', async (userId: number) => {
        console.log('message was sent---------', userId, user);
        if (user?.id && userId !== user.id) {
          getRooms();
        }
        // handleGetRoom(userId);
      });
    }, // eslint-disable-next-line react-hooks/exhaustive-deps
    [user],
  );

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
      }}>
      {children}
    </BadgeContext.Provider>
  );
};

export const useHandleBadge = () => useContext(BadgeContext);
