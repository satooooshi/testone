import React, {useState} from 'react';
import {ScrollView, View} from 'react-native';
import {
  PropsInterface,
  CallbacksInterface,
  RtcPropsInterface,
} from 'agora-rn-uikit';
import {
  MaxVideoView,
  MinVideoView,
  RtcConfigure,
} from 'agora-rn-uikit/Components';
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
};

const VideoCall: React.FC<VideoCallProps> = ({rtcProps, callbacks}) => {
  const [videoCall, setVideoCall] = useState(true);
  const props: PropsInterface = {
    rtcProps: rtcProps,
    callbacks: callbacks,
  };
  const {width: windowWidth, height: windowHeight} = useWindowDimensions();
  const {data: profile, isLoading: loadingProfile} = useAPIGetUserInfoById(
    props.rtcProps.uid.toString(),
  );
  console.log('profile ======', profile);

  return videoCall ? (
    <View style={props.styleProps?.UIKitContainer}>
      <RtcConfigure>
        {/* <MaxUidConsumer>
          {maxUsers =>
            maxUsers[0] ? (
              <MaxVideoView user={maxUsers[0]} key={maxUsers[0].uid} />
            ) : null
          }
        </MaxUidConsumer> */}
        <ScrollView
          showsHorizontalScrollIndicator={false}
          horizontal={true}
          style={{
            ...styles.minContainer,
            width: '100%',
          }}>
          {/* <MinUidConsumer>
            {minUsers =>
              minUsers.map(user => (
                <MinVideoView user={user} key={user.uid} showOverlay={true} />
              ))
            }
          </MinUidConsumer> */}
          <Div alignItems="center">
            <Div my={'lg'}>
              {/* <UserAvatar
                user={profile}
                h={windowWidth * 0.6}
                w={windowWidth * 0.6}
              /> */}
              <Text fontWeight="bold" mb={'lg'} mr="lg" fontSize={24}>
                {userNameFactory(profile)}
              </Text>
            </Div>
          </Div>
        </ScrollView>
      </RtcConfigure>
    </View>
  ) : null;
};
export default VideoCall;
