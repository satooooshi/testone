import React, {useEffect} from 'react';
import Navigator from './navigator';
import {AuthenticateProvider} from './contexts/useAuthenticate';
import {QueryClientProvider, QueryClient} from 'react-query';
import 'react-native-gesture-handler';
import RNBootSplash from 'react-native-bootsplash';

const App = () => {
  const queryClient = new QueryClient();

  useEffect(() => {
    (async () => {
      await RNBootSplash.hide({fade: true});
    })();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthenticateProvider>
        <Navigator />
      </AuthenticateProvider>
    </QueryClientProvider>
  );
};

export default App;
