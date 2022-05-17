/* eslint-disable @typescript-eslint/no-empty-function */
import React, {createContext, useContext, useState} from 'react';
import {ChatGroup} from '../../types';

const RoomRefetchContext = createContext({
  newRoom: {} as ChatGroup | undefined,
  setNewChatGroup: (() => {}) as (room: ChatGroup | undefined) => void,
});

export const RoomRefetchProvider: React.FC = ({children}) => {
  const [newRoom, setNewRoom] = useState<ChatGroup>();

  const setNewChatGroup = (room: ChatGroup | undefined) => {
    setNewRoom(room);
  };

  return (
    <RoomRefetchContext.Provider
      value={{
        newRoom,
        setNewChatGroup,
      }}>
      {children}
    </RoomRefetchContext.Provider>
  );
};

export const useHandleBadge = () => useContext(RoomRefetchContext);
