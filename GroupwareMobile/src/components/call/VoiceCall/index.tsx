import React from 'react';
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

type VoiceCallProps = {
  rtcProps: RtcPropsInterface;
  callbacks: Partial<CallbacksInterface>;
  onCallUid: string;
  channelName: string;
};
const VoiceCall: React.FC<VoiceCallProps> = ({
  rtcProps,
  callbacks,
  onCallUid,
  channelName,
}) => {
  const props: React.PropsWithChildren<PropsInterface> = {
    rtcProps: rtcProps,
    callbacks: callbacks,
  };
  const {width: windowWidth, height: windowHeight} = useWindowDimensions();
  const {data: profile} = useAPIGetUserInfoById(onCallUid);

  return (
    <PropsProvider value={props}>
      <Div h={windowHeight}>
        <RtcConfigure>
          <Div alignItems="center" mt={'40%'}>
            <Div my={'lg'}>
              <UserAvatar
                user={profile}
                h={windowWidth * 0.5}
                w={windowWidth * 0.5}
              />
            </Div>
            <Text fontWeight="bold" mt={'lg'} mb={'lg'} fontSize={24}>
              {userNameFactory(profile)}
            </Text>
            {channelName ? <Timer /> : null}
          </Div>
          <Controls />
        </RtcConfigure>
      </Div>
    </PropsProvider>
  );
};
export default VoiceCall;
