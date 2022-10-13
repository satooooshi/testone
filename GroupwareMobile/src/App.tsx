import React, {useEffect} from 'react';
import Navigator from './navigator';
import {AuthenticateProvider} from './contexts/useAuthenticate';
import {QueryClientProvider, QueryClient} from 'react-query';
import 'react-native-gesture-handler';
import RNBootSplash from 'react-native-bootsplash';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import {Alert, Linking, Platform} from 'react-native';
import VersionCheck from 'react-native-version-check';
import {InviteCallProvider} from './contexts/call/useInviteCall';
import {BadgeProvider} from './contexts/badge/useHandleBadge';
import {IsTabBarVisibleProvider} from './contexts/bottomTab/useIsTabBarVisible';
import {Provider} from 'react-native-paper';

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

  useEffect(() => {
    const checkVersion = async () => {
      if (Platform.OS === 'android') {
        const needOrNot = await VersionCheck.needUpdate({
          provider: 'playStore',
          //@ts-ignore
          country: 'jp',
        });
        if (needOrNot?.isNeeded) {
          Alert.alert('アプリを更新してください', '', [
            {
              text: 'ストアを開く',
              onPress: () => {
                Linking.openURL(needOrNot.storeUrl);
              },
            },
          ]);
        }
      } else {
        const res = await fetch(
          'https://send-latest-ios-version-sgzkfl3uyq-an.a.run.app',
        );
        const latestVersion = Number(await res.json());
        const currentVersion = Number(VersionCheck.getCurrentVersion());
        const isUpdateNeeded = currentVersion < latestVersion;
        // if (isUpdateNeeded) {
        //   Alert.alert('アプリを更新してください', '', [
        //     {
        //       text: 'TestFlightを開く',
        //       onPress: () => {
        //         Linking.openURL('itms-beta://testflight.apple.com');
        //       },
        //     },
        //   ]);
        // }
      }
    };

    checkVersion();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Provider>
        <AuthenticateProvider>
          <IsTabBarVisibleProvider>
            <BadgeProvider>
              <InviteCallProvider>
                <Navigator />
              </InviteCallProvider>
            </BadgeProvider>
          </IsTabBarVisibleProvider>
        </AuthenticateProvider>
      </Provider>
    </QueryClientProvider>
  );
};

export default App;
