/* eslint-disable @typescript-eslint/no-empty-function */
import { createContext, useContext, useState } from 'react';
import { ChatGroup } from 'src/types';

const RoomRefetchContext = createContext({
  refetchNeeded: false,
  needRefetch: () => {},
  clearRefetch: () => {},
  newRoom: {} as ChatGroup | undefined,
  setNewChatGroup: (() => {}) as (room: ChatGroup | undefined) => void,
});

export const RoomRefetchProvider: React.FC = ({ children }) => {
  const [refetchNeeded, setRefetchNeeded] = useState(false);
  const [newRoom, setNewRoom] = useState<ChatGroup>();

  const needRefetch = () => {
    setRefetchNeeded(true);
  };

  const clearRefetch = () => {
    setRefetchNeeded(false);
  };

  const setNewChatGroup = (room: ChatGroup | undefined) => {
    setNewRoom(room);
  };

  return (
    <RoomRefetchContext.Provider
      value={{
        refetchNeeded,
        needRefetch,
        clearRefetch,
        newRoom,
        setNewChatGroup,
      }}>
      {children}
    </RoomRefetchContext.Provider>
  );
};

export const useRoomRefetch = () => useContext(RoomRefetchContext);
