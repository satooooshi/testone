import React, {useState} from 'react';
import {ScrollView, View} from 'react-native';
import {
  CallbacksInterface,
  RtcPropsInterface,
  PropsInterface,
  layout,
} from 'agora-rn-uikit';
import {
  MaxVoiceView,
  MinVoiceView,
  RtcConfigure,
  Controls,
  Endcall,
  LocalAudioMute,
  LocalVideoMute,
  SwitchCamera,
  RemoteAudioMute,
  RemoteSwap,
  RemoteVideoMute,
  RemoteControls,
  BtnTemplate,
  PinnedVideo,
  GridVideo,
} from 'agora-rn-uikit/Components';
// import PropsProvider from 'agora-rn-uikit';
import {PropsProvider} from 'agora-rn-uikit/src/PropsContext';
// import {
//   RtcConfigure,
//   PropsProvider,
//   layout,
//   PropsInterface,
// } from 'agora-rn-uikit';
// import LocalControls from 'agora-rn-uikit/src/Controls/LocalControls';
import styles from 'agora-rn-uikit/src/Style';
import {useAPIGetUserInfoById} from '../../../../src/hooks/api/user/useAPIGetUserInfoById';
import {Text, Div, ScrollDiv, Button} from 'react-native-magnus';
import {useWindowDimensions} from 'react-native';
import UserAvatar from '../../../components/common/UserAvatar';
import {userNameFactory} from '../../../utils/factory/userNameFactory';

type VoiceCallProps = {
  rtcProps: RtcPropsInterface;
  callbacks: Partial<CallbacksInterface>;
  onCallUid: string;
};
// const VoiceCall: React.FC<PropsInterface> = props => {
const VoiceCall: React.FC<VoiceCallProps> = ({
  rtcProps,
  callbacks,
  onCallUid,
}) => {
  const props: React.PropsWithChildren<PropsInterface> = {
    rtcProps: rtcProps,
    callbacks: callbacks,
  };
  const {width: windowWidth} = useWindowDimensions();
  const {data: profile} = useAPIGetUserInfoById(onCallUid);
  console.log('profile ======', profile);

  return (
    <PropsProvider value={props}>
      <View style={props.styleProps?.UIKitContainer}>
        <RtcConfigure>
          <Div alignItems="center">
            <Div my={'lg'} mt={'20%'}>
              <UserAvatar
                user={profile}
                h={windowWidth * 0.5}
                w={windowWidth * 0.5}
              />
            </Div>
            <Text fontWeight="bold" mt={'lg'} fontSize={24}>
              {userNameFactory(profile)}
            </Text>
          </Div>
          <Controls showButton={false} />
          {/* <LocalControls showButton={props.rtcProps.layout !== layout.grid} /> */}
        </RtcConfigure>
      </View>
    </PropsProvider>
  );
};
export default VoiceCall;
