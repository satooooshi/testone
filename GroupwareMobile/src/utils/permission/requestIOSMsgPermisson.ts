import messaging from '@react-native-firebase/messaging';

export const requestIOSMsgPermission = async () => {
  const authStatus = await messaging().requestPermission();
  // if (!messaging().isDeviceRegisteredForRemoteMessages) {
  // await messaging().registerDeviceForRemoteMessages();
  // }
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (enabled) {
    console.log('Authorization status:', authStatus);
  }
};
