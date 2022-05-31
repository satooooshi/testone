/* eslint-disable @typescript-eslint/no-empty-function */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { User } from 'src/types';

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

export const AuthenticateProvider: React.FC = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [profile, setProfile] = useState<Partial<User>>();
  const [currentChatRoomId, setCurrentChatRoom] = useState<number>();

  const authenticate = () => {
    setIsAuthenticated(true);
  };

  const setUser = (user: Partial<User>) => {
    setProfile(user);
  };

  const setCurrentChatRoomId = (id: number | undefined) => {
    setCurrentChatRoom(id);
  };

  const getCurrentChatRoomId = useCallback(() => {
    return currentChatRoomId;
  }, [currentChatRoomId]);

  const logout = () => {
    setProfile(undefined);
    setIsAuthenticated(false);
  };

  useEffect(() => {
    console.log('-----', currentChatRoomId);
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
