import React, {createContext, useContext, useEffect, useState} from 'react';

const IsTabBarVisibleContext = createContext({
  isTabBarVisible: true,
  safeAreaViewHeight: 47,
  setIsTabBarVisible: (() => {}) as (isTabBarVisible: boolean) => void,
  updateSafeAreaViewHeight: (() => {}) as (h: number) => void,
});

export const IsTabBarVisibleProvider: React.FC = ({children}) => {
  const [isVisible, setIsVIsible] = useState(true);
  const [safeAreaViewHeight, setHeight] = useState(47);

  const setIsTabBarVisible = (isTabBarVisible: boolean) => {
    setIsVIsible(isTabBarVisible);
  };

  const updateSafeAreaViewHeight = (h: number) => {
    setHeight(h);
  };

  return (
    <IsTabBarVisibleContext.Provider
      value={{
        isTabBarVisible: isVisible,
        setIsTabBarVisible,
        safeAreaViewHeight,
        updateSafeAreaViewHeight,
      }}>
      {children}
    </IsTabBarVisibleContext.Provider>
  );
};

export const useIsTabBarVisible = () => useContext(IsTabBarVisibleContext);
