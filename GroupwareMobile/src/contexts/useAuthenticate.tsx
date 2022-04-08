import React, {useEffect} from 'react';
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
});

export const AuthenticateProvider: React.FC = ({children}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [profile, setProfile] = useState<Partial<User>>();
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

  return (
    <AuthenticateContext.Provider
      value={{
        isAuthenticated,
        authenticate,
        logout,
        user: profile,
        setUser,
      }}>
      {children}
    </AuthenticateContext.Provider>
  );
};

export const useAuthenticate = () => useContext(AuthenticateContext);
