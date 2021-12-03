import React, {useEffect} from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {
  NavigationContainer,
  useNavigationContainerRef,
} from '@react-navigation/native';
import Login from '../screens/auth/Login';
import {useAuthenticate} from '../contexts/useAuthenticate';
import {RootStackParamList} from '../types/navigator/RootStackParamList';
import DrawerTab from './Drawer';
import {tokenString} from '../utils/url';
import messaging from '@react-native-firebase/messaging';
import PushNotification from 'react-native-push-notification';
import {Platform} from 'react-native';

const Stack = createStackNavigator<RootStackParamList>();

const Navigator = () => {
  const {user} = useAuthenticate();
  const navigationRef = useNavigationContainerRef<any>();

  useEffect(() => {
    const naviateByNotif = (notification: any) => {
      if (navigationRef.current?.getCurrentRoute?.name !== 'Login') {
        if (notification.data?.screen === 'event' && notification.data?.id) {
          navigationRef.current?.navigate('EventStack', {
            screen: 'EventDetail',
            params: {id: notification.data?.id},
            initial: false,
          });
        }
        if (notification.data?.screen === 'wiki' && notification.data?.id) {
          navigationRef.current?.navigate('WikiStack', {
            screen: 'WikiDetail',
            params: {id: notification.data?.id},
            initial: false,
          });
        }
        if (notification.data?.screen === 'room') {
          navigationRef.current?.navigate('ChatStack', {
            screen: 'RooomList',
          });
        }
        if (notification.data?.screen === 'chat' && notification.data?.id) {
          navigationRef.current?.navigate('ChatStack', {
            screen: 'Chat',
            params: {room: {id: notification.data?.id}},
            initial: false,
          });
        }
      }
    };
    PushNotification.configure({
      onNotification: notification => {
        if (
          Platform.OS !== 'android' ||
          (Platform.OS === 'android' && notification.userInteraction)
        ) {
          naviateByNotif(notification);
        }
      },
      requestPermissions: true,
    });
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      console.log(remoteMessage);
      PushNotification.localNotification({
        channelId: remoteMessage.notification?.android?.channelId,
        ignoreInForeground: false,
        id: remoteMessage.messageId,
        message: remoteMessage.notification?.body || '',
        title: remoteMessage.notification?.title,
        bigPictureUrl: remoteMessage.notification?.android?.imageUrl,
        userInfo: remoteMessage.data,
      });
    });

    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator
        initialRouteName={user?.id || tokenString() ? 'Main' : 'Login'}>
        {user?.id || tokenString() ? (
          <>
            <Stack.Screen
              name="Main"
              component={DrawerTab}
              options={{headerShown: false}}
            />
          </>
        ) : (
          <Stack.Screen
            name="Login"
            component={Login}
            options={{headerShown: false}}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Navigator;
