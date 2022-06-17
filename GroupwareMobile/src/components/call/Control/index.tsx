import React from 'react';
import {View, StyleSheet} from 'react-native';
import LocalUserContext from 'agora-rn-uikit/src/LocalUserContext';
import {Icon, Button} from 'react-native-magnus';
import {
  LocalAudioMute,
  LocalVideoMute,
  Endcall,
} from 'agora-rn-uikit/Components';
import {
  AirplayButton,
  showRoutePicker,
  useExternalPlaybackAvailability,
} from 'react-airplay';
import {Platform, Alert, AlertButton} from 'react-native';
import AudioOutput from 'react-native-switch-audio-output-android';

const style = StyleSheet.create({
  buttons: {
    position: 'absolute',
    bottom: 120,
    left: 0,
    marginTop: '10%',
    width: '100%',
    height: 70,
    zIndex: 10,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  EndButton: {
    position: 'absolute',
    bottom: 25,
    left: 0,
    marginTop: '10%',
    width: '100%',
    height: 70,
    zIndex: 10,
    alignItems: 'center',
  },
});

const Controls = () => {
  const isExternalPlaybackAvailable = useExternalPlaybackAvailability();

  const showSpeakerDevices = async () => {
    if (Platform.OS === 'android') {
      const devices = await AudioOutput.getAudioDevices();
      const alertButtons: AlertButton[] = [
        {
          text: 'Speaker',
          onPress: () => {
            AudioOutput.setAudioDevice('Speaker');
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
            AudioOutput.setAudioDevice('Headphones');
          },
        });
      }

      Alert.alert('音声の出力を選択', '', alertButtons);
    } else {
      showRoutePicker({prioritizesVideoDevices: false});
    }
  };
  const showSpeakerChanger =
    Platform.OS === 'android' || isExternalPlaybackAvailable;

  return (
    <LocalUserContext>
      <View style={style.buttons}>
        <LocalAudioMute />
        <LocalVideoMute />
        {showSpeakerChanger && (
          <>
            <Button
              rounded="circle"
              bg="#007aff"
              mt={10}
              onPress={showSpeakerDevices}>
              <Icon
                name="bluetooth-audio"
                fontFamily="MaterialIcons"
                fontSize={24}
                color="white"
              />
            </Button>
          </>
        )}
      </View>
      <View style={style.EndButton}>
        <Endcall />
      </View>
    </LocalUserContext>
  );
};

export default Controls;
