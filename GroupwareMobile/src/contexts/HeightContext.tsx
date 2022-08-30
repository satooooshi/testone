import React, {createContext, useState} from 'react';

export const HeightContext = createContext({
  height: 20,
  updateHeight: (() => {}) as (h: number) => void, //(h: number) => {},
});

export const HeightContextProvider = ({children}) => {
  const [height, setHeight] = useState(0);
  const updateHeight = (h: number) => {
    console.log('update to ', h);
    setHeight(h);
  };

  return (
    <HeightContext.Provider
      value={{
        height,
        updateHeight,
      }}>
      {children}
    </HeightContext.Provider>
  );
};
