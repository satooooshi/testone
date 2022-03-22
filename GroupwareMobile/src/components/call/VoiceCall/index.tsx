import React, {useEffect, useState} from 'react';
import {
  CallbacksInterface,
  RtcPropsInterface,
  PropsInterface,
} from 'agora-rn-uikit';
import {RtcConfigure} from 'agora-rn-uikit/Components';
import {PropsProvider} from 'agora-rn-uikit/src/PropsContext';
import {useAPIGetUserInfoById} from '../../../../src/hooks/api/user/useAPIGetUserInfoById';
import {Text, Div} from 'react-native-magnus';
import {Platform, useWindowDimensions} from 'react-native';
import UserAvatar from '../../../components/common/UserAvatar';
import {userNameFactory} from '../../../utils/factory/userNameFactory';
import Timer from '../../common/Timer';
import Controls from '../Control';
import {useInviteCall} from '../../../contexts/call/useInviteCall';
import SoundPlayer from 'react-native-sound-player';

type VoiceCallProps = {
  rtcProps: RtcPropsInterface;
  callbacks: Partial<CallbacksInterface>;
  onCallUid: string;
  isJoining: boolean;
  isCalling: boolean;
};
const VoiceCall: React.FC<VoiceCallProps> = ({
  rtcProps,
  callbacks,
  onCallUid,
  isJoining,
  isCalling,
}) => {
  const props: React.PropsWithChildren<PropsInterface> = {
    rtcProps: rtcProps,
    callbacks: callbacks,
  };
  const {width: windowWidth, height: windowHeight} = useWindowDimensions();
  const {data: profile} = useAPIGetUserInfoById(onCallUid ? onCallUid : '0');
  const [isRinging, setRinging] = useState(false);
  const {ringCall, stopRing} = useInviteCall();

  // const ringCall = () => {
  //   SoundPlayer.playSoundFile('ring_call', 'mp3');
  // };
  // const stopRing = () => {
  //   SoundPlayer.stop();
  // };

  useEffect(() => {
    if (isJoining && !isCalling && !isRinging) {
      console.log('================');

      ringCall();
      setRinging(true);
    } else if (!isJoining || isCalling) {
      stopRing();
    }
  }, [isJoining, isCalling]);

  return (
    <PropsProvider value={props}>
      <Div h={windowHeight}>
        <RtcConfigure>
          <Div alignItems="center" mt={'40%'}>
            <Div my={'lg'}>
              {profile ? (
                <UserAvatar
                  user={profile}
                  h={windowWidth * 0.5}
                  w={windowWidth * 0.5}
                />
              ) : null}
            </Div>
            <Text fontWeight="bold" mt={'lg'} mb={'lg'} fontSize={24}>
              {profile ? userNameFactory(profile) : '通話情報を取得中...'}
            </Text>
            {isCalling ? (
              <Timer />
            ) : (
              <Text mt={'lg'} mb={'lg'} fontSize={20}>
                呼び出し中
              </Text>
            )}
          </Div>
          <Controls />
        </RtcConfigure>
      </Div>
    </PropsProvider>
  );
};
export default VoiceCall;
