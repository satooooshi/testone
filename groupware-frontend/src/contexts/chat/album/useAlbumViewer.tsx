/* eslint-disable @typescript-eslint/no-empty-function */
import { createContext, useContext, useState } from 'react';
import { ImageDecorator } from 'react-viewer/lib/ViewerProps';
import { User } from 'src/types';

const AuthenticateContext = createContext({
  isAuthenticated: false,
  authenticate: () => {},
});

export const AuthenticateProvider: React.FC = ({ children }) => {
  const [imagesViewer, setImagesInViewer] = useState<ImageDecorator[]>([]);

  const setViewer = (images: ImageDecorator[]) => {
    setImagesInViewer(images);
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
