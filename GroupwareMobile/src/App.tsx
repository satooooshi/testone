import React, {useEffect} from 'react';
import Navigator from './navigator';
import {AuthenticateProvider} from './contexts/useAuthenticate';
import {QueryClientProvider, QueryClient} from 'react-query';
import 'react-native-gesture-handler';
import {requestIOSMsgPermission} from './utils/permission/requestIOSMsgPermisson';
import messaging from '@react-native-firebase/messaging';
import {Alert, Platform} from 'react-native';

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
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      Alert.alert('A new FCM message arrived!', JSON.stringify(remoteMessage));
    });

    return unsubscribe;
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
