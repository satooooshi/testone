/* eslint-disable @typescript-eslint/no-empty-function */
import React, {createContext, useContext, useState} from 'react';
import {ChatGroup} from '../../types';

const RoomRefetchContext = createContext({
  editRoom: {} as ChatGroup | undefined,
  setNewChatGroup: (() => {}) as (room: ChatGroup | undefined) => void,
});

export const RoomRefetchProvider: React.FC = ({children}) => {
  const [editRoom, setEditRoom] = useState<ChatGroup>();

  const setNewChatGroup = (room: ChatGroup | undefined) => {
    setEditRoom(room);
  };

  return (
    <RoomRefetchContext.Provider
      value={{
        editRoom,
        setNewChatGroup,
      }}>
      {children}
    </RoomRefetchContext.Provider>
  );
};

export const useHandleBadge = () => useContext(RoomRefetchContext);
