import React from 'react';
import {
  CallbacksInterface,
  RtcPropsInterface,
  PropsInterface,
} from 'agora-rn-uikit';
import {RtcConfigure, Controls} from 'agora-rn-uikit/Components';
import {PropsProvider} from 'agora-rn-uikit/src/PropsContext';
import {useAPIGetUserInfoById} from '../../../../src/hooks/api/user/useAPIGetUserInfoById';
import {Text, Div} from 'react-native-magnus';
import {useWindowDimensions, Button} from 'react-native';
import UserAvatar from '../../../components/common/UserAvatar';
import {userNameFactory} from '../../../utils/factory/userNameFactory';
import {
  AirplayButton,
  showRoutePicker,
  useAirplayConnectivity,
  useExternalPlaybackAvailability,
} from 'react-airplay';

type VoiceCallProps = {
  rtcProps: RtcPropsInterface;
  callbacks: Partial<CallbacksInterface>;
  onCallUid: string;
};
const VoiceCall: React.FC<VoiceCallProps> = ({
  rtcProps,
  callbacks,
  onCallUid,
}) => {
  const props: React.PropsWithChildren<PropsInterface> = {
    rtcProps: rtcProps,
    callbacks: callbacks,
  };
  const {width: windowWidth, height: windowHeight} = useWindowDimensions();
  const {data: profile} = useAPIGetUserInfoById(onCallUid);
  const isAirplayConnected = useAirplayConnectivity();
  const isExternalPlaybackAvailable = useExternalPlaybackAvailability();
  console.log(isExternalPlaybackAvailable);

  return (
    <PropsProvider value={props}>
      {/* <View style={props.styleProps?.UIKitContainer}> */}
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
          </Div>
          <Controls showButton={false} />
          {isExternalPlaybackAvailable && (
            <>
              <AirplayButton
                prioritizesVideoDevices={true}
                tintColor={'red'}
                activeTintColor={'blue'}
                style={{
                  width: 24,
                  height: 24,
                }}
              />
              <Button
                title="スピーカーを変更"
                onPress={() =>
                  showRoutePicker({prioritizesVideoDevices: false})
                }
              />
            </>
          )}
        </RtcConfigure>
      </Div>
      {/* </View> */}
    </PropsProvider>
  );
};
export default VoiceCall;
