import React, {useEffect} from 'react';
import Navigator from './navigator';
import {AuthenticateProvider} from './contexts/useAuthenticate';
import {QueryClientProvider, QueryClient} from 'react-query';
import 'react-native-gesture-handler';
import {requestIOSMsgPermission} from './utils/permission/requestIOSMsgPermisson';
import messaging from '@react-native-firebase/messaging';
import RNBootSplash from 'react-native-bootsplash';
import WebEngine from './components/WebEngine';

const App = () => {
  const queryClient = new QueryClient();

  useEffect(() => {
    const handleMessaging = async () => {
      await requestIOSMsgPermission();
      // const token =
      //   Platform.OS === 'android'
      //     ? await messaging().getToken()
      //     : await messaging().getAPNSToken();
      const token = await messaging().getToken();
      console.log('token:', token);

      // Listen to whether the token changes
      return messaging().onTokenRefresh(tokenChanged => {
        // saveTokenToDatabase(token);
        console.log('token changed: ', tokenChanged);
      });
    };
    handleMessaging();
  }, []);

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
