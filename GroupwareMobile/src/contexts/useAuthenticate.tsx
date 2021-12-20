import React, {useEffect} from 'react';
import {createContext, useContext, useState} from 'react';
import {User} from '../types';
import {useAPIAuthenticate} from '../hooks/api/auth/useAPIAuthenticate';
import {storage} from '../utils/url';
import {Alert} from 'react-native';
import {AxiosError} from 'axios';

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
      if (err.response?.data) {
        Alert.alert((err.response?.data as AxiosError)?.message);
      }
      logout();
    },
  });

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
