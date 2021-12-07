import {useCallback, useRef} from 'react';
import {DrawerLayout} from 'react-native-gesture-handler';

export const useMinimumDrawer = () => {
  const drawerRef = useRef<DrawerLayout>(null);
  const openDrawer = useCallback(() => {
    drawerRef.current?.openDrawer();
  }, []);
  const closeDrawer = useCallback(() => {
    drawerRef.current?.closeDrawer();
  }, []);
  return {
    drawerRef,
    openDrawer,
    closeDrawer,
  };
};
