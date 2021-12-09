import React, {useEffect} from 'react';
import Navigator from './navigator';
import {AuthenticateProvider} from './contexts/useAuthenticate';
import {QueryClientProvider, QueryClient} from 'react-query';
import 'react-native-gesture-handler';
import RNBootSplash from 'react-native-bootsplash';
import WebEngine from './components/WebEngine';

const App = () => {
  const queryClient = new QueryClient();

  useEffect(() => {
    (async () => {
      await RNBootSplash.hide({fade: true});
    })();
  }, []);

  return (
    <WebEngine>
      <QueryClientProvider client={queryClient}>
        <AuthenticateProvider>
          <Navigator />
        </AuthenticateProvider>
      </QueryClientProvider>
    </WebEngine>
  );
};

export default App;
