/* eslint-disable @typescript-eslint/no-empty-function */
import { createContext, useContext, useState } from 'react';
import { User } from 'src/types';

const AuthenticateContext = createContext({
  isAuthenticated: false,
  authenticate: () => {},
  logout: () => {},
  user: {} as Partial<User> | undefined,
  setUser: (() => {}) as (user: Partial<User>) => void,
});

export const AuthenticateProvider: React.FC = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [profile, setProfile] = useState<Partial<User>>();

  const authenticate = () => {
    setIsAuthenticated(true);
  };

  const setUser = (user: Partial<User>) => {
    setProfile(user);
  };

  const logout = () => {
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
