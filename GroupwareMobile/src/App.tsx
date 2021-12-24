import React, {useEffect} from 'react';
import Navigator from './navigator';
import {AuthenticateProvider} from './contexts/useAuthenticate';
import {QueryClientProvider, QueryClient} from 'react-query';
import 'react-native-gesture-handler';
import RNBootSplash from 'react-native-bootsplash';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import {Platform} from 'react-native';

const App = () => {
  const queryClient = new QueryClient();

  useEffect(() => {
    (async () => {
      await RNBootSplash.hide({fade: true});
    })();
  }, []);

  useEffect(() => {
    if (Platform.OS === 'ios') {
      PushNotificationIOS.getApplicationIconBadgeNumber(num => {
        // get current number
        if (num >= 1) {
          PushNotificationIOS.setApplicationIconBadgeNumber(0); //set number to 0
        }
      });
    }
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
