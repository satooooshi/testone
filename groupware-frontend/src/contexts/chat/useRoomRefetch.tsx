/* eslint-disable @typescript-eslint/no-empty-function */
import { createContext, useContext, useState } from 'react';

const RoomRefetchContext = createContext({
  refetchNeeded: false,
  needRefetch: () => {},
  clearRefetch: () => {},
});

export const RoomRefetchProvider: React.FC = ({ children }) => {
  const [refetchNeeded, setRefetchNeeded] = useState(false);

  const needRefetch = () => {
    setRefetchNeeded(true);
  };

  const clearRefetch = () => {
    setRefetchNeeded(false);
  };

  return (
    <RoomRefetchContext.Provider
      value={{
        refetchNeeded,
        needRefetch,
        clearRefetch,
      }}>
      {children}
    </RoomRefetchContext.Provider>
  );
};

export const useRoomRefetch = () => useContext(RoomRefetchContext);
