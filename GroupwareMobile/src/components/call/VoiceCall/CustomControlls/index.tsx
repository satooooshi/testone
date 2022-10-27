import {
  LocalAudioMute,
  LocalVideoMute,
  RemoteControls,
} from 'agora-rn-uikit/Components';
import EndCall from 'agora-rn-uikit/src/Controls/Local/EndCall';
import LocalUserContext from 'agora-rn-uikit/src/LocalUserContext';
import {MaxUidConsumer} from 'agora-rn-uikit/src/MaxUidContext';
import PropsContext, {role} from 'agora-rn-uikit/src/PropsContext';
import React, {useContext} from 'react';
import {showRoutePicker} from 'react-airplay';
import {Alert, AlertButton, Platform, StyleSheet, View} from 'react-native';
import {Button, Icon} from 'react-native-magnus';
import AudioOutput from 'react-native-switch-audio-output-android';

const CustomControlls = (props: {showButton: Boolean}) => {
  const {styleProps, rtcProps} = useContext(PropsContext);
  const {localBtnContainer, maxViewRemoteBtnContainer} = styleProps || {};
  const showButton = props.showButton !== undefined ? props.showButton : true;

  const showSpeakerDevices = async () => {
    if (Platform.OS === 'android') {
      const devices = await AudioOutput.getAudioDevices();
      const alertButtons: AlertButton[] = [
        {
          text: 'Speaker',
          onPress: () => {
            AudioOutput.setAudioDevice('このデバイス');
          },
        },
      ];
      if (devices.includes('Bluetooth')) {
        alertButtons.push({
          text: 'Bluetooth',
          onPress: () => {
            AudioOutput.setAudioDevice('Bluetooth');
          },
        });
      }
      if (devices.includes('Headphones')) {
        alertButtons.push({
          text: 'Headphones',
          onPress: () => {
            AudioOutput.setAudioDevice('イヤホン');
          },
        });
      }

      Alert.alert('音声の出力を選択', '', alertButtons);
    } else {
      showRoutePicker({prioritizesVideoDevices: false});
    }
  };

  return (
    <LocalUserContext>
      <View style={{...styles.Controls, ...(localBtnContainer as object)}}>
        {rtcProps.role === role.Audience ? (
          <EndCall />
        ) : (
          <>
            <LocalAudioMute />
            <LocalVideoMute />
            <Button
              bg="#007aff"
              onPress={() => showSpeakerDevices()}
              rounded="circle">
              <Icon
                color="white"
                fontSize={24}
                fontFamily="MaterialIcons"
                name="airplay"
              />
            </Button>
            <EndCall />
          </>
        )}
      </View>
      {showButton ? (
        <MaxUidConsumer>
          {users => (
            <View
              style={{
                ...styles.Controls,
                //@ts-ignore
                bottom: styles.Controls.bottom + 70,
                ...(maxViewRemoteBtnContainer as object),
              }}>
              <RemoteControls user={users[0]} showRemoteSwap={false} />
            </View>
          )}
        </MaxUidConsumer>
      ) : (
        <></>
      )}
    </LocalUserContext>
  );
};
const styles = StyleSheet.create({
  max: {
    flex: 1,
  },
  buttonHolder: {
    height: 100,
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#0093E9',
    borderRadius: 25,
  },
  buttonText: {
    color: '#fff',
  },
  fullView: {
    width: '100%',
    height: '100%',
  },
  minView: {
    width: 240,
    height: 135,
  },
  minContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    padding: 0,
    margin: 0,
    height: 135,
  },
  Controls: {
    // position: 'absolute',
    // bottom: 25,
    // left: 0,
    marginTop: '10%',
    width: '100%',
    height: 70,
    zIndex: 10,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  minOverlay: {
    ...(StyleSheet.absoluteFill as object),
    backgroundColor: 'black',
    opacity: 0.7,
    height: '100%',
  },
  minCloseBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.1)',
    width: 46,
    height: 46,
    borderRadius: 23,
    position: 'absolute',
    right: 5,
    top: 5,
  },
  controlBtn: {
    width: 46,
    height: 46,
    backgroundColor: 'rgba(0,0,0,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  leftRemoteBtn: {
    borderTopLeftRadius: 23,
    borderBottomLeftRadius: 23,
    borderRightWidth: 4 * StyleSheet.hairlineWidth,
    borderColor: '#fff',
  },
  rightRemoteBtn: {
    borderTopRightRadius: 23,
    borderBottomRightRadius: 23,
    borderLeftWidth: 4 * StyleSheet.hairlineWidth,
    borderColor: '#fff',
  },
  remoteBtnContainer: {
    width: '100%',
    display: 'flex',
    // marginVertical: '25%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignSelf: 'center',
    height: '100%',
    alignItems: 'center',
  },
  localBtn: {
    borderRadius: 23,
    borderWidth: 4 * StyleSheet.hairlineWidth,
    borderColor: '#007aff',
    backgroundColor: '#007aff',
  },
  endCall: {
    borderRadius: 23,
    borderWidth: 4 * StyleSheet.hairlineWidth,
    borderColor: '#f14',
    width: 46,
    height: 46,
    backgroundColor: '#f14',
  },
});

export default CustomControlls;
