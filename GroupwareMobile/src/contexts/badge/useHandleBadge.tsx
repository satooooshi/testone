import React, {useContext, createContext, useState, useEffect} from 'react';
import {io} from 'socket.io-client';
import {ChatMessage} from '../../types';
import {baseURL} from '../../utils/url';

const BadgeContext = createContext({
  unreadChatCount: 0,
  setUnreadChatCount: (() => {}) as (count: number) => void,
});

export const BadgeProvider: React.FC = ({children}) => {
  const [chatUnreadCount, setChatUnreadCount] = useState(0);
  const socket = io(baseURL, {
    transports: ['websocket'],
  });
  useEffect(() => {
    socket.on('badgeClient', async (sentMsgByOtherUsers: ChatMessage) => {
      console.log(sentMsgByOtherUsers);
    });
  }, [socket]);
  const setUnreadChatCount = (count: number) => {
    setChatUnreadCount(unreadCount => unreadCount + count);
  };
  return (
    <BadgeContext.Provider
      value={{unreadChatCount: chatUnreadCount, setUnreadChatCount}}>
      {children}
    </BadgeContext.Provider>
  );
};

export const useHandleBadge = () => useContext(BadgeContext);
