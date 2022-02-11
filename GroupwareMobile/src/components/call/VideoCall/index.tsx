import React, {useState} from 'react';
import {ScrollView, View} from 'react-native';
import {
  PropsInterface,
  CallbacksInterface,
  RtcPropsInterface,
  layout,
} from 'agora-rn-uikit';
import {
  MaxVideoView,
  MinVideoView,
  // MaxVoiceView,
  // MinVoiceView,
  RtcConfigure,
  Controls,
  Endcall,
  SwitchCamera,
  BtnTemplate,
  PinnedVideo,
  GridVideo,
} from 'agora-rn-uikit/Components';
import {PropsProvider} from 'agora-rn-uikit/src/PropsContext';
import {MaxUidConsumer} from 'agora-rn-uikit/src/MaxUidContext';
import {MinUidConsumer} from 'agora-rn-uikit/src/MinUidContext';
import styles from 'agora-rn-uikit/src/Style';
import {useAPIGetUserInfoById} from '../../../../src/hooks/api/user/useAPIGetUserInfoById';
import {Text, Div, ScrollDiv, Button, Icon} from 'react-native-magnus';
import {Alert, useWindowDimensions} from 'react-native';
import UserAvatar from '../../../components/common/UserAvatar';
import {userNameFactory} from '../../../utils/factory/userNameFactory';

type VideoCallProps = {
  rtcProps: RtcPropsInterface;
  callbacks: Partial<CallbacksInterface>;
  onCallUid: string;
};

const VideoCall: React.FC<VideoCallProps> = ({
  rtcProps,
  callbacks,
  onCallUid,
}) => {
  const [videoCall, setVideoCall] = useState(true);
  const props: React.PropsWithChildren<PropsInterface> = {
    rtcProps: rtcProps,
    callbacks: callbacks,
  };
  const {width: windowWidth, height: windowHeight} = useWindowDimensions();

  return videoCall ? (
    <PropsProvider value={props}>
      <View style={props.styleProps?.UIKitContainer}>
        <RtcConfigure>
          <MaxUidConsumer>
            {maxUsers =>
              maxUsers[0] ? (
                <MaxVideoView user={maxUsers[0]} key={maxUsers[0].uid} />
              ) : null
            }
          </MaxUidConsumer>
          <ScrollView
            showsHorizontalScrollIndicator={false}
            horizontal={true}
            style={{
              ...styles.minContainer,
              width: '100%',
            }}>
            <MinUidConsumer>
              {minUsers =>
                minUsers.map(user => (
                  <MinVideoView user={user} key={user.uid} showOverlay={true} />
                ))
              }
            </MinUidConsumer>
          </ScrollView>
          <Controls showButton={false} />
        </RtcConfigure>
      </View>
    </PropsProvider>
  ) : null;
};
export default VideoCall;
