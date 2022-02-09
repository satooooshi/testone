import React, {useEffect, useRef, useState} from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {
  NavigationContainer,
  useNavigationContainerRef,
} from '@react-navigation/native';
import Login from '../screens/auth/Login';
import {useAuthenticate} from '../contexts/useAuthenticate';
import {RootStackParamList} from '../types/navigator/RootStackParamList';
import DrawerTab from './Drawer';
import {axiosInstance, storage, tokenString} from '../utils/url';
import messaging from '@react-native-firebase/messaging';
import PushNotification from 'react-native-push-notification';
import {requestIOSMsgPermission} from '../utils/permission/requestIOSMsgPermisson';
import {useAPIRegisterDevice} from '../hooks/api/notification/useAPIRegisterDevice';
import ForgotPassword from '../screens/auth/ForgotPassword';
import WebEngine from '../components/WebEngine';
import RtmClient, {RemoteInvitation} from 'agora-react-native-rtm';
import RNCallKeep, {IOptions} from 'react-native-callkeep';
import AgoraUIKit, {
  CallbacksInterface,
  RtcPropsInterface,
} from 'agora-rn-uikit';
import RtcEngine, {RtcEngineContext} from 'react-native-agora';
import {userNameFactory} from '../utils/factory/userNameFactory';
import {apiAuthenticate} from '../hooks/api/auth/useAPIAuthenticate';
import {Alert, Platform} from 'react-native';
import Config from 'react-native-config';

const Stack = createStackNavigator<RootStackParamList>();
export const rtmEngine = new RtmClient();
let rtcEngine: RtcEngine;

const Navigator = () => {
  const {user} = useAuthenticate();
  const navigationRef = useNavigationContainerRef<any>();
  const {mutate: registerDevice} = useAPIRegisterDevice();
  const [videoCall, setVideoCall] = useState(false);
  const [agoraToken, setAgoraToken] = useState('');
  const [channelName, setChannelName] = useState('');
  const AGORA_APP_ID = Config.AGORA_APP_ID;
  const rtcProps: RtcPropsInterface = {
    appId: AGORA_APP_ID,
    channel: channelName,
    token: agoraToken,
    enableVideo: false,
  };
  const remoteInvitation = useRef<RemoteInvitation | undefined>();
  const endCall = async () => {
    remoteInvitation.current = undefined;
    await rtcEngine?.leaveChannel();
    RNCallKeep.endAllCalls();
    setVideoCall(false);
    setChannelName('');
  };

  const callbacks: Partial<CallbacksInterface> = {
    EndCall: endCall,
    LocalMuteVideo: async bool => {
      if (bool) {
        await rtcEngine?.adjustPlaybackSignalVolume(100);
        await rtcEngine?.adjustRecordingSignalVolume(100);
      } else {
        await rtcEngine?.adjustPlaybackSignalVolume(400);
        await rtcEngine?.adjustRecordingSignalVolume(400);
      }
    },
  };

  // console.log(rtcEngine);
  const rtcInit = async () => {
    rtcEngine = await RtcEngine.createWithContext(
      new RtcEngineContext(AGORA_APP_ID),
    );
    await rtcEngine?.disableVideo();

    rtcEngine?.addListener('UserJoined', (uid, elapsed) => {
      console.log('UserJoined', uid, elapsed);
    });
    rtcEngine?.addListener('UserOffline', (uid, reason) => {
      console.log('UserOffline', uid, reason);
      Alert.alert('通話が終了しました');
      endCall();
    });
    rtcEngine?.addListener('LeaveChannel', ({userCount}) => {
      console.log('LeaveChannel. user count: ', userCount);
    });
    rtcEngine?.addListener('JoinChannelSuccess', (channel, uid, elapsed) => {
      console.log('JoinChannelSuccess', channel, uid, elapsed);
    });
    rtcEngine?.addListener('Error', errCode => {
      console.log('errCode', errCode);
    });
  };
  messaging().setBackgroundMessageHandler(async remoteMessage => {
    if (Platform.OS === 'ios') {
      if (remoteMessage?.data?.type === 'call') {
        RNCallKeep.backToForeground();
      }
    }
    console.log('Message handled in the background!', remoteMessage);
  });

  const callKeepSetup = async () => {
    const options: IOptions = {
      ios: {
        appName: 'Eface',
        supportsVideo: true,
      },
      android: {
        alertTitle: '通話機能を利用するためには許可が必要です',
        alertDescription:
          '通話機能を利用するためには通話アカウントにこのアプリを登録してください',
        cancelButton: 'Cancel',
        okButton: 'ok',
        // additionalPermissions: [PermissionsAndroid.PERMISSIONS.example],
        foregroundService: {
          channelId: 'com.groupwaremobile',
          channelName: 'Foreground service for my app',
          notificationTitle: 'バックグラウンドで実行中です',
        },
        selfManaged: false,
      },
    };

    try {
      await RNCallKeep.setup(options);
      RNCallKeep.setAvailable(true);
      RNCallKeep.addEventListener('didLoadWithEvents', events => {
        console.log(events);
      });
    } catch (err) {
      //@ts-ignore
      console.error('Initialize CallKeep Error:', err?.message);
    }
  };

  const displayIncomingCallNow = (callingData: RemoteInvitation) => {
    console.log('Event: Display Incoming Call: ', callingData);
    RNCallKeep.displayIncomingCall(
      callingData?.channelId as string,
      userNameFactory(user),
      callingData?.content,
      'generic',
      false,
    );
  };

  const joinChannel = async (realChannelName: string) => {
    const res = await axiosInstance.get<string>(
      `/chat/get-voice-token/${realChannelName}`,
    );
    const tokenForCall = res.data;
    const userData = await apiAuthenticate();
    const userId = userData?.id;
    if (userId) {
      await rtcInit();
      await rtcEngine?.joinChannel(tokenForCall, realChannelName, null, userId);
      await rtcEngine?.disableVideo();
      setChannelName(realChannelName);
      setVideoCall(true);
    }
  };

  const answerCall = async () => {
    RNCallKeep.endAllCalls();
    if (remoteInvitation.current?.channelId) {
      const realChannelName = remoteInvitation.current?.channelId as string;
      if (Platform.OS === 'ios') {
        //https://github.com/AgoraIO/agora-react-native-rtm/issues/52
        await rtmEngine.acceptRemoteInvitationV2({
          ...remoteInvitation.current,
          hash: 0,
        });
      } else {
        await rtmEngine.acceptRemoteInvitationV2(remoteInvitation.current);
      }
      await joinChannel(realChannelName);
    }
  };

  useEffect(() => {
    rtcInit();
    callKeepSetup();
    rtmEngine.addListener('LocalInvitationAccepted', async invitation => {
      const realChannelName = invitation?.channelId as string;
      await joinChannel(realChannelName);
    });
    rtmEngine.addListener(
      'RemoteInvitationReceived',
      (invitation: RemoteInvitation) => {
        RNCallKeep.backToForeground();
        remoteInvitation.current = invitation;
        displayIncomingCallNow(invitation);
      },
    );
    RNCallKeep.addEventListener('answerCall', answerCall);
    return () => {
      RNCallKeep.removeEventListener('answerCall');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const getRtmToken = async () => {
      const res = await axiosInstance.get<string>('/chat/get-rtm-token');
      console.log('rtmToken', res.data);
      storage.set('rtmToken', res.data);
      setAgoraToken(res.data);
      if (user?.id && res.data) {
        await rtmEngine.createInstance(AGORA_APP_ID);
        await rtmEngine.loginV2(user?.id.toString(), res.data);
        console.log('login as ', user?.id.toString());
      }
    };
    getRtmToken();
  }, [user?.id]);

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
        if (notification.userInteraction) {
          naviateByNotif(notification);
        }
      },
      requestPermissions: true,
    });
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      PushNotification.localNotification({
        channelId: 'default-channel-id',
        ignoreInForeground: false,
        id: remoteMessage.messageId,
        vibrate: true, // (optional) default: true
        vibration: 300,
        priority: 'high', // (optional) set notification priority, default: high

        visibility: 'public', // (optional) set notification visibility, default: private

        message: remoteMessage.notification?.body || '',
        title: remoteMessage.notification?.title,
        bigPictureUrl: remoteMessage.notification?.android?.imageUrl,
        userInfo: {
          screen: remoteMessage?.data?.screen,
          id: remoteMessage?.data?.id,
        },
      });
    });

    return unsubscribe;
  }, [navigationRef]);

  useEffect(() => {
    const handleMessaging = async () => {
      if (user) {
        await requestIOSMsgPermission();
        // const token =
        //   Platform.OS === 'android'
        //     ? await messaging().getToken()
        //     : await messaging().getAPNSToken();
        const token = await messaging().getToken();
        console.log('token', token);
        if (token) {
          registerDevice({token});
        }

        // Listen to whether the token changes
        return messaging().onTokenRefresh(tokenChanged => {
          if (token) {
            registerDevice({token: tokenChanged});
          }
          // saveTokenToDatabase(token);
          console.log('token changed: ', tokenChanged);
        });
      }
    };
    handleMessaging();
  }, [registerDevice, user]);

  useEffect(() => {
    if (videoCall && channelName) {
      navigationRef.current?.navigate('Call');
    } else {
      navigationRef.current?.navigate('Main');
    }
  }, [videoCall, channelName]);

  return (
    <NavigationContainer ref={navigationRef}>
      <WebEngine>
        <Stack.Navigator
          initialRouteName={user?.id || tokenString() ? 'Main' : 'Login'}>
          {user?.id || tokenString() ? (
            <>
              <Stack.Screen
                name="Main"
                component={DrawerTab}
                options={{headerShown: false}}
              />
              <Stack.Screen
                name="Call"
                children={() => (
                  <AgoraUIKit rtcProps={rtcProps} callbacks={callbacks} />
                )}
              />
            </>
          ) : (
            <>
              <Stack.Screen
                name="Login"
                component={Login}
                options={{headerShown: false}}
              />
              <Stack.Screen
                name="ForgotPassword"
                component={ForgotPassword}
                options={{headerShown: false}}
              />
            </>
          )}
        </Stack.Navigator>
      </WebEngine>
    </NavigationContainer>
  );
};

export default Navigator;
