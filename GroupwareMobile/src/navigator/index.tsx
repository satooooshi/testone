import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {
  NavigationContainer,
  useNavigationContainerRef,
} from '@react-navigation/native';
import Login from '../screens/auth/Login';
import {useAuthenticate} from '../contexts/useAuthenticate';
import {RootStackParamList} from '../types/navigator/RootStackParamList';
import {axiosInstance, storage, tokenString} from '../utils/url';
import BottomTab from './BottomTab';
import messaging, {
  FirebaseMessagingTypes,
} from '@react-native-firebase/messaging';
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
import {Alert, AppState, Platform} from 'react-native';
import Config from 'react-native-config';
import VoiceCall from '../components/call/VoiceCall';
import {useInviteCall} from '../contexts/call/useInviteCall';
import SoundPlayer from 'react-native-sound-player';
import {debounce} from 'lodash';
import notifee, {EventType} from '@notifee/react-native';
import PushNotification, {
  ReceivedNotification,
} from 'react-native-push-notification';

const Stack = createStackNavigator<RootStackParamList>();
export const rtmEngine = new RtmClient();
//rtcはメソッド使用直前にcreateInstanceしないとエラーがでることがある
let rtcEngine: RtcEngine;
let callKeepUUID = '';

const Navigator = () => {
  const {user, currentChatRoomId} = useAuthenticate();
  const navigationRef = useNavigationContainerRef<any>();
  const {mutate: registerDevice} = useAPIRegisterDevice({
    onSuccess: updatedInfo => {
      console.log('RegisterDevice success--------', updatedInfo);
    },
    onError: () => {
      Alert.alert('fail to register device');
    },
  });
  const {
    isCallAccepted,
    enableCallAcceptedFlag,
    disableCallAcceptedFlag,
    setLocalInvitationState,
    localInvitation,
    stopRing,
    sendCallHistory,
  } = useInviteCall();
  const [isJoining, setIsJoining] = useState(false);
  const [isCalling, setIsCalling] = useState(false);
  const [callTimeout, setCallTimeout] = useState(false);
  const [agoraToken, setAgoraToken] = useState('');
  const [channelName, setChannelName] = useState('');
  const [onCallUid, setOnCallUid] = useState('');
  const [refusedInvitation, setRefusedInvitation] = useState(false);
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

  useEffect(() => {
    const handleMessaging = async () => {
      if (user?.id) {
        await requestIOSMsgPermission();
        // const token =
        //   Platform.OS === 'android'
        //     ? await messaging().getToken()
        //     : await messaging().getAPNSToken();
        const token = await messaging().getToken();

        if (token) {
          registerDevice({token});
        }
      }
    };
    handleMessaging();
  }, [registerDevice, user]);

  messaging().onTokenRefresh(tokenChanged => {
    registerDevice({token: tokenChanged});
    // saveTokenToDatabase(token);
    console.log('token changed: ', tokenChanged);
  });

  const endCall = useCallback(
    async (isCallKeep: boolean = false) => {
      if (isCallKeep && !remoteInvitation.current && !localInvitation) {
        console.log('end call called by endAllCalls');
        return;
      }
      if (!isCallAccepted && localInvitation) {
        // local invitation(送信した通話招待)があればcancelする
        await rtmEngine?.cancelLocalInvitationV2(localInvitation);
        if (callTimeout) {
          sendCallHistory('応答なし');
        } else {
          sendCallHistory('キャンセル');
        }
      } else if (!callKeepUUID && !isCallKeep) {
        if (AppState.currentState === 'active') {
          setAlertCountOnEndCall(c => c + 1);
        }
        await soundOnEnd();
      }
      setChannelName('');
      setIsJoining(false);
      setIsCalling(false);
      setCallTimeout(false);
      disableCallAcceptedFlag();
      setLocalInvitationState(undefined);
      if (remoteInvitation.current && callKeepUUID) {
        reject();
        // remote invitation(送られてきた通話招待)があればrefuseする
        await rtmEngine?.refuseRemoteInvitationV2({
          ...remoteInvitation.current,
          hash: 0,
        });
      }
      remoteInvitation.current = undefined;
      if (Platform.OS === 'ios') {
        RNCallKeep.endAllCalls();
      }
      // initしないとエラーがでることがある
      await rtcInit();
      await rtcEngine?.leaveChannel();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      disableCallAcceptedFlag,
      isCallAccepted,
      localInvitation,
      setLocalInvitationState,
      callTimeout,
      remoteInvitation.current,
      AppState.currentState,
    ],
  );

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
    // UserOfflineはチャンネルから人が退出したときのイベント
    // 詳しくはnode_modules/react-native-agora/lib/typescript/src/common/RtcEvents.d.tsに書いてある
    rtcEngine?.addListener('UserOffline', async (uid, reason) => {
      console.log('UserOffline', uid, reason);
      await endCall();
    });
    rtcEngine?.addListener('ConnectionStateChanged', async (state, reason) => {
      console.log('ConnectionStateChanged ', Platform.OS, state, reason);
    });
    rtcEngine?.addListener('LeaveChannel', async ({userCount}) => {
      console.log('LeaveChannel. user count: ', Platform.OS, userCount);
      // await endCall();
    });
    rtcEngine?.addListener('JoinChannelSuccess', (channel, uid, elapsed) => {
      console.log('JoinChannelSuccess', channel, uid, elapsed);
    });
    rtcEngine?.addListener('Error', errCode => {
      console.log('errCode', errCode);
    });
  }, [createRTCInstance, endCall]);

  const debouncedEndCall = debounce(endCall, 100);

  const callbacks: Partial<CallbacksInterface> = {
    EndCall: debouncedEndCall,
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

  // messaging().setBackgroundMessageHandler(async remoteMessage => {
  //   console.log('BackgroundMessage received!!', remoteMessage);
  //   sendLocalNotification(remoteMessage);
  // });

  // useEffect(
  //   () => {
  //     if (refusedInvitation) {
  //       sendCallHistory('応答なし');
  //       disableCallAcceptedFlag();
  //       setLocalInvitationState(undefined);
  //       stopRing();
  //       setIsJoining(false);
  //       setRefusedInvitation(false);
  //     }
  //   }, // eslint-disable-next-line react-hooks/exhaustive-deps
  //   [refusedInvitation],
  // );

  const rtmInit = async () => {
    await rtmEngine.createInstance(AGORA_APP_ID);
    // listenerを複数登録しないようにする
    rtmEngine.removeAllListeners();
    rtmEngine.addListener('RemoteInvitationCanceled', async () => {
      await endCall(true);
    });
    rtmEngine.addListener('LocalInvitationRefused', async () => {
      setRefusedInvitation(true);
      // navigationRef.current?.navigate('Main');
    });
    rtmEngine.addListener('LocalInvitationAccepted', async invitation => {
      enableCallAcceptedFlag();
      setIsCalling(true);
      setLocalInvitationState(undefined);
      const realChannelName = invitation?.channelId as string;
      await joinChannel(realChannelName);
    });
    rtmEngine.addListener(
      'RemoteInvitationReceived',
      async (invitation: RemoteInvitation) => {
        displayIncomingCallNow(invitation);
      },
    );
    // rtmEngine.addListener('LocalInvitationCanceled', () => {
    //   endCall(false);
    // });
  };

  const callKeepInit = async () => {
    const options: IOptions = {
      ios: {
        appName: 'Eface',
        supportsVideo: false,
        imageName: 'bold-logo.png',
        maximumCallGroups: '1',
        maximumCallsPerCallGroup: '2',
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
      RNCallKeep.addEventListener('answerCall', answerCall);
      // ユーザーが通話拒否ボタンを押したときはアラート等を出さないようにする
      RNCallKeep.addEventListener('endCall', () => endCall(true));
    } catch (err) {
      //@ts-ignore
      console.error('Initialize CallKeep Error:', err?.message);
    }
  };

  const displayIncomingCallNow = (callingData: RemoteInvitation) => {
    if (callingData?.channelId) {
      callKeepUUID = callingData.channelId;
    }
    if (Platform.OS === 'ios') {
      // iOSの場合はhashを0にしないとinvitationを使う諸々の処理でエラーが起こる
      // https://github.com/AgoraIO/agora-react-native-rtm/issues/52#issuecomment-1015078875
      remoteInvitation.current = {...callingData, hash: 0};
    } else {
      remoteInvitation.current = callingData;
    }
    const callerId = callingData.callerId;
    setOnCallUid(callerId);
    // RNCallKeep.backToForeground();
    RNCallKeep.displayIncomingCall(
      callingData?.channelId as string,
      userNameFactory(user),
      callingData?.content,
      'generic',
      false,
    );
  };
  // const navigateToCallWindow = useCallback(() => {
  //   navigationRef.current?.navigate('Call');
  // }, [navigationRef]);

  const joinChannel = useCallback(
    async (realChannelName: string) => {
      const res = await axiosInstance.get<string>(
        `/chat/get-voice-token/${realChannelName}`,
      );
      const tokenForCall = res.data;
      const userData = await apiAuthenticate();
      const userId = userData?.id;
      if (userId) {
        callKeepUUID = '';
        await rtcInit();
        await rtcEngine?.joinChannel(
          tokenForCall,
          realChannelName,
          null,
          userId,
        );
        await rtcEngine?.disableVideo();
        setChannelName(realChannelName);
        // remoteInvitation.current = undefined;
        // navigateToCallWindow();
        setIsJoining(true);
      }
    },
    [rtcInit],
  );
  // console.log(Platform.OS, 'callerId', onCallUid);
  // const [startCall, setStartCall] = useState(false);

  const answerCall = async () => {
    // アプリをバックグラウンドからフォアグラウンドに
    // if (Platform.OS === 'ios' && AppState.currentState === 'background') {
    //   await new Promise(r => setTimeout(r, 1000));
    // }
    const invitation = remoteInvitation.current;
    const realChannelName = remoteInvitation.current?.channelId as string;
    // RNCallKeep.answerIncomingCall(realChannelName);
    RNCallKeep.backToForeground();
    // RNCallKeep.setMutedCall(realChannelName, true);
    // await RNCallKeep.setAudioRoute(realChannelName, routeName);

    if (invitation && realChannelName) {
      // 招待を承認
      await rtmEngine.acceptRemoteInvitationV2(invitation);
      await joinChannel(realChannelName);
      setIsCalling(true);
      if (Platform.OS === 'android') {
        remoteInvitation.current = undefined;
        RNCallKeep.endAllCalls();
      }
    }
    //   if (Platform.OS === 'android') {
    //     if (invitation && realChannelName) {
    //       // 招待を承認
    //       console.log('answer call called');
    //       await rtmEngine.acceptRemoteInvitationV2(invitation);
    //       await joinChannel(realChannelName);
    //       setIsCalling(true);
    //     }
    //   } else {
    //     setStartCall(true);
    //   }
  };

  // useEffect(() => {
  //   console.log(
  //     '-------------------',
  //     AppState.currentState,
  //     startCall,
  //     user?.id,
  //   );

  //   const execAnswerCall = async () => {
  //     if (remoteInvitation.current?.channelId) {
  //       const realChannelName = remoteInvitation.current?.channelId as string;
  //       // 招待を承認
  //       await rtmEngine.acceptRemoteInvitationV2(remoteInvitation.current);
  //       await joinChannel(realChannelName);
  //       setIsCalling(true);
  //       setStartCall(false);
  //     }
  //   };
  //   if (AppState.currentState !== 'active' && startCall) {
  //     execAnswerCall();
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [AppState.currentState, startCall]);

  useEffect(() => {
    if (localInvitation?.calleeId) {
      setOnCallUid(localInvitation?.calleeId as string);
    }
  }, [localInvitation]);

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
      // アンマウント時に全てのリスナーを消す
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
        storage.set('rtmToken', res.data);
        setAgoraToken(res.data);
        if (res.data) {
          //rtmにログインしないとinvitationが受け取れないので、アプリ起動時かユーザーがログインしたときにrtmにもログインする(ログインIDは自由に決められるのでアプリのユーザーIDをrtmのログインIDにする)
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

  const sendLocalNotification = async (
    remoteMessage: Omit<ReceivedNotification, 'userInfo'>,
  ) => {
    if (!remoteMessage?.data?.calleeId) {
      const channelId = await notifee.createChannel({
        id: 'default',
        name: 'Default Channel',
      });

      await notifee.displayNotification({
        title: remoteMessage.data?.title || '',
        body: remoteMessage.data?.message || '',
        android: {
          channelId: channelId,
          pressAction: {
            id: 'action_id',
            launchActivity: 'default',
          },
        },
        data: {
          screen: remoteMessage?.data?.screen
            ? remoteMessage?.data?.screen
            : '',
          id: remoteMessage?.data?.id ? remoteMessage?.data?.id : '',
        },
        ios: {
          // iOS resource (.wav, aiff, .caf)
          sound: 'local.wav',
        },
      });
    }
  };

  // const sendLocalNotification = async (
  //   remoteMessage: FirebaseMessagingTypes.RemoteMessage,
  // ) => {
  //   if (!remoteMessage?.data?.calleeId) {
  //     const channelId = await notifee.createChannel({
  //       id: 'default',
  //       name: 'Default Channel',
  //     });

  //     await notifee.displayNotification({
  //       title: remoteMessage.data?.title || '',
  //       body: remoteMessage.data?.body || '',
  //       android: {
  //         channelId: channelId,
  //         pressAction: {
  //           id: 'action_id',
  //           launchActivity: 'default',
  //         },
  //       },
  //       data: {
  //         screen: remoteMessage?.data?.screen
  //           ? remoteMessage?.data?.screen
  //           : '',
  //         id: remoteMessage?.data?.id ? remoteMessage?.data?.id : '',
  //       },
  //       ios: {
  //         // iOS resource (.wav, aiff, .caf)
  //         sound: 'local.wav',
  //       },
  //     });
  //   }
  // };

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
            screen: 'RoomList',
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

    notifee.onForegroundEvent(({type, detail}) => {
      switch (type) {
        case EventType.DISMISSED:
          break;
        case EventType.PRESS:
          naviateByNotif(detail.notification);
          break;
      }
    });
    notifee.onBackgroundEvent(async ({type, detail}) => {
      switch (type) {
        case EventType.DISMISSED:
          break;
        case EventType.PRESS:
          naviateByNotif(detail.notification);
      }
    });
    notifee.requestPermission();

    PushNotification.configure({
      onRegister: function (token) {
        console.log('PushNotification TOKEN:', token);
      },
      onNotification: notification => {
        console.log('PushNotification onNotification========', notification);
        sendLocalNotification(notification);
      },
      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },
      requestPermissions: true,
    });

    // const unsubscribe = messaging().onMessage(async remoteMessage => {
    //   if (
    //     remoteMessage?.data?.screen &&
    //     remoteMessage.data?.id === `${currentChatRoomId}`
    //   ) {
    //     return;
    //   }
    //   sendLocalNotification(remoteMessage);
    // });

    // return unsubscribe;
  }, [navigationRef, currentChatRoomId]);

  useEffect(() => {
    if (isJoining) {
      navigationRef.current?.navigate('Call');
    } else if (user?.id) {
      navigationRef.current?.navigate('Main');
    }
  }, [isJoining, navigationRef, user?.id]);

  useEffect(
    () => {
      if (localInvitation) {
        const joining = async () => {
          const realChannelName = localInvitation?.channelId as string;
          await joinChannel(realChannelName);
          // 応答なしだと自動で終了する(テスト)
          // await new Promise(r => setTimeout(r, 20000));
          // setCallTimeout(true);
        };
        joining();
      }
    }, // eslint-disable-next-line react-hooks/exhaustive-deps
    [localInvitation],
  );

  useEffect(
    () => {
      const cancelCallByTimeout = async () => {
        if (localInvitation && !isCallAccepted) {
          // await rtmEngine?.cancelLocalInvitationV2(localInvitation);
          await endCall(true);
        }
      };
      if (callTimeout) {
        cancelCallByTimeout();
      }
    }, // eslint-disable-next-line react-hooks/exhaustive-deps
    [callTimeout],
  );

  return (
    <NavigationContainer ref={navigationRef}>
      <WebEngine>
        <Stack.Navigator
          initialRouteName={user?.id || tokenString() ? 'Main' : 'Login'}>
          {user?.id || tokenString() ? (
            <>
              <Stack.Screen
                name="Main"
                component={BottomTab}
                options={{headerShown: false}}
              />
              <Stack.Screen
                options={{headerShown: false}}
                name="Call"
                children={() => (
                  <VoiceCall
                    isCalling={isCalling}
                    rtcProps={rtcProps}
                    callbacks={callbacks}
                    onCallUid={onCallUid}
                    CallTimeout={() => setCallTimeout(true)}
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
