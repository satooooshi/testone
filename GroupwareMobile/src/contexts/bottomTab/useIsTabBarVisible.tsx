import React, {createContext, useContext, useState} from 'react';

const IsTabBarVisibleContext = createContext({
  isTabBarVisible: 'inline',
  setTabBarVisible: () => {},
  setTabBarUnVisible: () => {},
});

export const IsTabBarVisibleProvider: React.FC = ({children}) => {
  const [isVisible, setIsVIsible] = useState<string>('inline');

  const setTabBarVisible = () => {
    setIsVIsible('inline');
  };
  const setTabBarUnVisible = () => {
    setIsVIsible('none');
  };

  return (
    <IsTabBarVisibleContext.Provider
      value={{
        isTabBarVisible: isVisible,
        setTabBarVisible,
        setTabBarUnVisible,
      }}>
      {children}
    </IsTabBarVisibleContext.Provider>
  );
};

export const useIsTabBarVisible = () => useContext(IsTabBarVisibleContext);
