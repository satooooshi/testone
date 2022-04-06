import React, {useCallback, useEffect} from 'react';
import {createContext, useContext, useState} from 'react';
import {User} from '../types';
import {useAPIAuthenticate} from '../hooks/api/auth/useAPIAuthenticate';
import {storage} from '../utils/url';
import {Alert} from 'react-native';
import {useAPIDeleteDevice} from '../hooks/api/notification/useAPIDeleteDevice';

const AuthenticateContext = createContext({
  isAuthenticated: false,
  authenticate: () => {},
  logout: () => {},
  user: {} as Partial<User> | undefined,
  setUser: (() => {}) as (user: Partial<User>) => void,
  currentChatRoomId: undefined as number | undefined,
  setCurrentChatRoomId: (() => {}) as (id: number | undefined) => void,
  getCurrentChatRoomId: (() => {}) as () => number | undefined,
});

export const AuthenticateProvider: React.FC = ({children}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [profile, setProfile] = useState<Partial<User>>();
  const [currentChatRoomId, setCurrentChatRoom] = useState<number>();
  const {mutate: mutateAuthenticate} = useAPIAuthenticate({
    onSuccess: userData => {
      if (userData && userData.id) {
        authenticate();
        setUser(userData);
      }
    },
    onError: err => {
      if (err.response?.status === 401) {
        Alert.alert(
          'ログインの有効期限が切れました',
          '再度ログインしてください',
        );
        logout();
      }
    },
  });
  const {mutate: deleteDevice} = useAPIDeleteDevice();

  useEffect(() => {
    mutateAuthenticate();
  }, [mutateAuthenticate]);

  const authenticate = () => {
    setIsAuthenticated(true);
  };

  const setUser = (user: Partial<User>) => {
    setProfile(user);
  };

  const logout = () => {
    const token = storage.getString('userToken');
    if (token) {
      deleteDevice(token);
    }
    storage.delete('userToken');
    setProfile(undefined);
    setIsAuthenticated(false);
  };

  const setCurrentChatRoomId = (id: number | undefined) => {
    console.log('setCurrentChatRoomId called ---', id);

    setCurrentChatRoom(id);
  };

  const getCurrentChatRoomId = useCallback(() => {
    console.log('get current called');

    return currentChatRoomId;
  }, [currentChatRoomId]);

  return (
    <AuthenticateContext.Provider
      value={{
        isAuthenticated,
        authenticate,
        logout,
        user: profile,
        setUser,
        currentChatRoomId,
        setCurrentChatRoomId,
        getCurrentChatRoomId,
      }}>
      {children}
    </AuthenticateContext.Provider>
  );
};

export const useAuthenticate = () => useContext(AuthenticateContext);
