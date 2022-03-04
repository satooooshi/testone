import React, {createContext, useContext, useEffect, useState} from 'react';

const IsTabBarVisibleContext = createContext({
  isTabBarVisible: true,
  setIsTabBarVisible: (() => {}) as (isTabBarVisible: boolean) => void,
});

export const IsTabBarVisibleProvider: React.FC = ({children}) => {
  const [isVisible, setIsVIsible] = useState(true);

  const setIsTabBarVisible = (isTabBarVisible: boolean) => {
    setIsVIsible(isTabBarVisible);
  };

  useEffect(() => {
    console.log('visible===========', isVisible);
  }, [isVisible]);

  return (
    <IsTabBarVisibleContext.Provider
      value={{
        isTabBarVisible: isVisible,
        setIsTabBarVisible,
      }}>
      {children}
    </IsTabBarVisibleContext.Provider>
  );
};

export const useIsTabBarVisible = () => useContext(IsTabBarVisibleContext);
