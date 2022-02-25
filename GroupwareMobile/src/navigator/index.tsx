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
import {Alert, Platform} from 'react-native';
import Config from 'react-native-config';
import VoiceCall from '../components/call/VoiceCall';
import {useInviteCall} from '../contexts/call/useInviteCall';
import SoundPlayer from 'react-native-sound-player';

const Stack = createStackNavigator<RootStackParamList>();
export const rtmEngine = new RtmClient();
let rtcEngine: RtcEngine;
let callKeepUUID = '';

const Navigator = () => {
  const {user} = useAuthenticate();
  const navigationRef = useNavigationContainerRef<any>();
  const {mutate: registerDevice} = useAPIRegisterDevice();
  const {
    isCallAccepted,
    enableCallAcceptedFlag,
    disableCallAcceptedFlag,
    setLocalInvitationState,
    localInvitation,
    stopRing,
  } = useInviteCall();
  const [isCalling, setIsCalling] = useState(false);
  const [agoraToken, setAgoraToken] = useState('');
  const [channelName, setChannelName] = useState('');
  const [onCallUid, setOnCallUid] = useState('');
  const [alertCountOnEndCall, setAlertCountOnEndCall] = useState(0);
  const AGORA_APP_ID = Config.AGORA_APP_ID;
  const rtcProps: RtcPropsInterface = {
    appId: AGORA_APP_ID,
    channel: channelName,
    token: agoraToken,
    enableVideo: false,
    activeSpeaker: true,
  };
  // const [callKeepUUID, setCallKeepUUUID] = useState('');
  const remoteInvitation = useRef<RemoteInvitation | undefined>();

  const soundOnEnd = async () => {
    try {
      SoundPlayer.playSoundFile('end_call', 'mp3');
    } catch (e) {
      console.log('sound on end call failed:', e);
    }
  };
  const reject = () => {
    if (callKeepUUID) {
      RNCallKeep.rejectCall(callKeepUUID);
      callKeepUUID = '';
    }
  };

  const endCall = useCallback(async () => {
    reject();
    if (remoteInvitation.current) {
      console.log('end call');
      console.log('end call finished');
      await rtmEngine?.refuseRemoteInvitationV2(remoteInvitation.current);
      remoteInvitation.current = undefined;
    }
    await rtcInit();
    await rtcEngine?.leaveChannel();
    const userInfo = await rtcEngine?.getUserInfoByUid(1327);
    console.log(userInfo);
    setAlertCountOnEndCall(c => c + 1);
    await soundOnEnd();
    disableCallAcceptedFlag();
    setIsCalling(false);
    setChannelName('');
    setOnCallUid('');
    if (!isCallAccepted && localInvitation) {
      console.log('attempt to cancel');
      await rtmEngine?.cancelLocalInvitationV2(localInvitation);
      setLocalInvitationState(undefined);
      console.log('cancel finished');
    }
    navigationRef.current?.navigate('Main');
    // await rtcEngine?.destroy();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    disableCallAcceptedFlag,
    isCallAccepted,
    localInvitation,
    navigationRef,
    setLocalInvitationState,
  ]);

  const createRTCInstance = useCallback(async () => {
    rtcEngine = await RtcEngine.createWithContext(
      new RtcEngineContext(AGORA_APP_ID),
    );
  }, [AGORA_APP_ID]);

  const rtcInit = useCallback(async () => {
    await createRTCInstance();
    await rtcEngine?.disableVideo();
    rtcEngine?.removeAllListeners();

    rtcEngine?.addListener('UserJoined', (uid, elapsed) => {
      console.log('UserJoined', uid, elapsed);
    });
    rtcEngine?.addListener('UserOffline', async (uid, reason) => {
      console.log('UserOffline', uid, reason);
      await endCall();
    });
    rtcEngine?.addListener('ConnectionStateChanged', async (state, reason) => {
      console.log('ConnectionStateChanged ', Platform.OS, state, reason);
    });
    rtcEngine?.addListener('LeaveChannel', async ({userCount}) => {
      console.log('LeaveChannel. user count: ', Platform.OS, userCount);
      await endCall();
    });
    rtcEngine?.addListener('JoinChannelSuccess', (channel, uid, elapsed) => {
      console.log('JoinChannelSuccess', channel, uid, elapsed);
    });
    rtcEngine?.addListener('Error', errCode => {
      console.log('errCode', errCode);
    });
  }, [createRTCInstance, endCall]);

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
  messaging().setBackgroundMessageHandler(async remoteMessage => {
    if (Platform.OS === 'ios') {
      if (remoteMessage?.data?.type === 'call') {
        displayIncomingCallNow(remoteMessage?.data as any);
      }
    }
    console.log('Message handled in the background!', remoteMessage);
  });

  const rtmInit = () => {
    rtmEngine.addListener('RemoteInvitationCanceled', async () => {
      console.log('canceled');
      await endCall();
    });
    rtmEngine.addListener('LocalInvitationRefused', async () => {
      disableCallAcceptedFlag();
      setLocalInvitationState(undefined);
      stopRing();
      navigationRef.current?.navigate('Main');
    });
    rtmEngine.addListener('LocalInvitationAccepted', async invitation => {
      enableCallAcceptedFlag();
      setLocalInvitationState(undefined);
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
  };

  const callKeepInit = async () => {
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
      RNCallKeep.addEventListener('answerCall', answerCall);
      RNCallKeep.addEventListener('endCall', endCall);
    } catch (err) {
      //@ts-ignore
      console.error('Initialize CallKeep Error:', err?.message);
    }
  };

  const displayIncomingCallNow = (callingData: RemoteInvitation) => {
    console.log('Event: Display Incoming Call: ', callingData);
    console.log('callingData.channelId', callingData.channelId);
    if (callingData?.channelId) {
      callKeepUUID = callingData.channelId;
    }
    remoteInvitation.current = callingData;
    setOnCallUid(callingData?.callerId as string);
    // RNCallKeep.backToForeground();
    RNCallKeep.displayIncomingCall(
      callingData?.channelId as string,
      userNameFactory(user),
      callingData?.content,
      'generic',
      false,
    );
  };
  const navigateToCallWindow = useCallback(() => {
    navigationRef.current?.navigate('Call');
  }, [navigationRef]);

  const joinChannel = useCallback(
    async (realChannelName: string) => {
      const res = await axiosInstance.get<string>(
        `/chat/get-voice-token/${realChannelName}`,
      );
      const tokenForCall = res.data;
      const userData = await apiAuthenticate();
      const userId = userData?.id;
      if (userId) {
        await rtcInit();
        await rtcEngine?.joinChannel(
          tokenForCall,
          realChannelName,
          null,
          userId,
        );
        await rtcEngine?.disableVideo();
        setChannelName(realChannelName);
        navigateToCallWindow();
        remoteInvitation.current = undefined;
        setIsCalling(true);
      }
    },
    [rtcInit, navigateToCallWindow],
  );

  const answerCall = async () => {
    RNCallKeep.backToForeground();
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

  //useEffectで処理しないと複数回アラートが出る可能性がある
  useEffect(() => {
    if (alertCountOnEndCall === 1) {
      Alert.alert('通話が終了しました', '', [
        {
          text: 'OK',
          onPress: () => {
            setAlertCountOnEndCall(0);
          },
        },
      ]);
    }
  }, [alertCountOnEndCall]);

  useEffect(() => {
    rtcInit();
    callKeepInit();
    rtmInit();
    return () => {
      RNCallKeep.removeEventListener('answerCall');
      RNCallKeep.removeEventListener('endCall');
      rtcEngine.removeAllListeners();
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
        await rtmEngine.createInstance(AGORA_APP_ID);
        await rtmEngine.logout();
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
    if (isCalling) {
      navigationRef.current?.navigate('Call');
    } else if (user?.id) {
      navigationRef.current?.navigate('Main');
    }
  }, [isCalling, navigationRef, user?.id]);

  useEffect(() => {
    if (localInvitation) {
      const joining = async () => {
        const realChannelName = localInvitation?.channelId as string;
        await joinChannel(realChannelName);
        navigationRef.current?.navigate('Call');
        //タイムアウト
        // await new Promise(r => setTimeout(r, 12000));
        // if (!isCallAccepted) {
        //   await endCall();
        //   navigationRef.current?.navigate('Main');
        // }
      };
      joining();
    }
  }, [endCall, isCallAccepted, joinChannel, localInvitation, navigationRef]);

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
                    isCalling={isCalling}
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
