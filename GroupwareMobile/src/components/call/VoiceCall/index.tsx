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
import {useWindowDimensions} from 'react-native';
import UserAvatar from '../../../components/common/UserAvatar';
import {userNameFactory} from '../../../utils/factory/userNameFactory';
import Timer from '../../common/Timer';
import Controls from '../Control';
import {useInviteCall} from '../../../contexts/call/useInviteCall';

type VoiceCallProps = {
  rtcProps: RtcPropsInterface;
  callbacks: Partial<CallbacksInterface>;
  onCallUid: string;
  isCalling: boolean;
  CallTimeout: () => void;
};
const VoiceCall: React.FC<VoiceCallProps> = ({
  rtcProps,
  callbacks,
  onCallUid,
  isCalling,
  CallTimeout,
}) => {
  const props: React.PropsWithChildren<PropsInterface> = {
    rtcProps: rtcProps,
    callbacks: callbacks,
  };
  const {width: windowWidth, height: windowHeight} = useWindowDimensions();
  const {data: profile} = useAPIGetUserInfoById(onCallUid ? onCallUid : '0');
  const [isRinging, setRinging] = useState(false);
  const {ringCall, stopRing} = useInviteCall();

  useEffect(() => {
    if (!isCalling && !isRinging) {
      setRinging(true);
      ringCall();
    } else if (isCalling) {
      setRinging(false);
      stopRing();
    }
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCalling]);

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
            <Timer CallTimeout={CallTimeout} isCalling={isCalling} />
          </Div>
          <Controls />
        </RtcConfigure>
      </Div>
    </PropsProvider>
  );
};
export default VoiceCall;
