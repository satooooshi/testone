import React, {useContext, createContext, useState, useEffect} from 'react';
import {io} from 'socket.io-client';
import {useAPIGetRooms} from '../../hooks/api/chat/useAPIGetRoomsByPage';
import {ChatGroup} from '../../types';
import {baseURL} from '../../utils/url';

const BadgeContext = createContext({
  roomList: {} as ChatGroup[],
  unreadChatCount: 0,
  setUnreadChatCount: (() => {}) as (count: number) => void,
  refetchRoom: () => {},
});

export const BadgeProvider: React.FC = ({children}) => {
  const [roomList, setRoomList] = useState<ChatGroup[]>([]);
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
        setRoomList(data.rooms);
        let count = 0;
        for (const room of data.rooms) {
          count += room.unreadCount;
        }
        console.log('count^^^^^^^^^^^^^^^^^^', count);
        setChatUnreadCount(count);
      },
    },
  );

  useEffect(() => {
    socket.on('badgeClient', async (status: string) => {
      console.log(status);
      if (status !== 'connected') {
        refetchAllRooms();
      }
    });
  }, []);

  const refetchRoom = () => {
    refetchAllRooms();
  };

  const setUnreadChatCount = (count: number) => {
    setChatUnreadCount(unreadCount => unreadCount + count);
  };
  return (
    <BadgeContext.Provider
      value={{
        roomList: roomList,
        unreadChatCount: chatUnreadCount,
        setUnreadChatCount,
        refetchRoom,
      }}>
      {children}
    </BadgeContext.Provider>
  );
};

export const useHandleBadge = () => useContext(BadgeContext);
