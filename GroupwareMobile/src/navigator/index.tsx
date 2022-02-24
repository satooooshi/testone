import React, {useCallback, useEffect, useRef, useState} from 'react';
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
import {CallbacksInterface, RtcPropsInterface} from 'agora-rn-uikit';
import RtcEngine, {RtcEngineContext} from 'react-native-agora';
import {userNameFactory} from '../utils/factory/userNameFactory';
import {apiAuthenticate} from '../hooks/api/auth/useAPIAuthenticate';
import {Platform} from 'react-native';
import Config from 'react-native-config';
import VoiceCall from '../components/call/VoiceCall';
import {useInviteCall} from '../contexts/call/useInviteCall';
import SoundPlayer from 'react-native-sound-player';

const Stack = createStackNavigator<RootStackParamList>();
export const rtmEngine = new RtmClient();
let rtcEngine: RtcEngine;

const Navigator = () => {
  const {user} = useAuthenticate();
  const navigationRef = useNavigationContainerRef<any>();
  const {mutate: registerDevice} = useAPIRegisterDevice();
  const {
    enableCallAcceptedFlag,
    disableCallAcceptedFlag,
    localInvitation,
    cancelInvitation,
  } = useInviteCall();
  const [calling, setCalling] = useState(false);
  const [agoraToken, setAgoraToken] = useState('');
  const [channelName, setChannelName] = useState('');
  const [onCallUid, setOnCallUid] = useState('2');
  const AGORA_APP_ID = Config.AGORA_APP_ID;
  const rtcProps: RtcPropsInterface = {
    appId: AGORA_APP_ID,
    channel: channelName,
    token: agoraToken,
    enableVideo: false,
    activeSpeaker: true,
  };
  const remoteInvitation = useRef<RemoteInvitation | undefined>();

  const soundOnEnd = async () => {
    try {
      SoundPlayer.playSoundFile('end_call', 'mp3');
    } catch (e) {
      console.log('sound on end call failed:', e);
    }
  };

  const endCall = async () => {
    if (remoteInvitation.current) {
      console.log('exists');
      rtmEngine?.refuseRemoteInvitationV2(remoteInvitation.current);
    }
    remoteInvitation.current = undefined;
    cancelInvitation();
    await soundOnEnd();
    await rtcEngine?.leaveChannel();
    RNCallKeep.endAllCalls();
    disableCallAcceptedFlag();
    setCalling(false);
    setChannelName('');
    navigationRef.current?.navigate('Main');
  };

  const callbacks: Partial<CallbacksInterface> = {
    EndCall: endCall,
    LocalMuteVideo: async bool => {
      if (bool) {
        if ((await rtcEngine?.isSpeakerphoneEnabled()) === true) {
          await rtcEngine?.setEnableSpeakerphone(true);
        }
        await rtcEngine?.adjustPlaybackSignalVolume(100);
        await rtcEngine?.adjustRecordingSignalVolume(100);
      } else {
        if ((await rtcEngine?.isSpeakerphoneEnabled()) === false) {
          await rtcEngine?.setEnableSpeakerphone(true);
        }
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
      endCall();
    });
    rtmEngine.addListener('RemoteInvitationCanceled', () => {
      console.log('RemoteInvitationCanceled');
      RNCallKeep.endAllCalls();
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
        additionalPermissions: [],
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
    remoteInvitation.current = callingData;
    setOnCallUid(callingData?.callerId as string);
    RNCallKeep.backToForeground();
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
      setCalling(true);
      navigateToCallWindow();
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

  const navigateToCallWindow = useCallback(() => {
    navigationRef.current?.navigate('Call');
  }, [navigationRef]);

  useEffect(() => {
    rtcInit();
    callKeepSetup();
    rtmEngine.addListener('LocalInvitationAccepted', async invitation => {
      enableCallAcceptedFlag();
      setOnCallUid(invitation?.calleeId as string);
      const realChannelName = invitation?.channelId as string;
      await joinChannel(realChannelName);
    });
    rtmEngine.addListener(
      'RemoteInvitationReceived',
      (invitation: RemoteInvitation) => {
        displayIncomingCallNow(invitation);
      },
    );
    rtmEngine.addListener('LocalInvitationCanceled', () => {
      endCall();
    });
    RNCallKeep.addEventListener('answerCall', answerCall);
    RNCallKeep.addEventListener('endCall', endCall);
    return () => {
      RNCallKeep.removeEventListener('answerCall');
      rtcEngine.removeAllListeners();
      RNCallKeep.removeEventListener('answerCall');
      RNCallKeep.removeEventListener('endCall');
      rtmEngine.removeAllListeners();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const getRtmToken = async () => {
      if (user?.id) {
        const res = await axiosInstance.get<string>('/chat/get-rtm-token');
        console.log('rtmToken', res.data);
        storage.set('rtmToken', res.data);
        setAgoraToken(res.data);
        if (res.data) {
          await rtmEngine.createInstance(AGORA_APP_ID);
          await rtmEngine.loginV2(user?.id.toString(), res.data);
          console.log('login as ', user?.id.toString());
        }
      } else {
        // await rtmEngine.logout();
      }
    };
    getRtmToken();
  }, [AGORA_APP_ID, user?.id]);

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
    if (localInvitation) {
      setCalling(true);
    } else {
      setCalling(false);
    }
  }, [localInvitation, navigationRef]);

  useEffect(() => {
    if (Platform.OS === 'android') {
      console.log('Androider', calling, localInvitation);
    } else {
      console.log('ios', calling, localInvitation);
    }
    if (calling || localInvitation) {
      navigateToCallWindow();
    } else if (user?.id) {
      navigationRef.current?.navigate('Main');
    }
  }, [calling, localInvitation, navigateToCallWindow, navigationRef, user?.id]);

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
                options={{headerShown: false}}
                name="Call"
                children={() => (
                  <VoiceCall
                    rtcProps={rtcProps}
                    callbacks={callbacks}
                    onCallUid={onCallUid}
                    channelName={channelName}
                  />
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
