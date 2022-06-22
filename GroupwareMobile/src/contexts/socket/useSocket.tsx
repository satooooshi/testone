import {createContext, FC, useContext} from 'react';
import {ChatGroup, ChatMessage} from '../../types';
import {useChatSocket} from '../../utils/socket';

const SocketContext = createContext({
  chatSocket: undefined as any,
});

type props = {
  room: ChatGroup;
  refreshMessage: (targetMessages: ChatMessage[]) => ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
};

export const SocketProvider: FC<props> = ({
  room,
  refreshMessage,
  setMessages,
  children,
}) => {
  const socket = useChatSocket(room, refreshMessage, setMessages);
  return (
    <SocketContext.Provider value={{chatSocket: socket}}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
