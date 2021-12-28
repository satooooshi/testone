import CameraRoll from '@react-native-community/cameraroll';
import {Alert, Platform} from 'react-native';
import {hasAndroidStoragePermission} from '../permission/hasAndroidStoragePermission';
import RNFetchBlob from 'rn-fetch-blob';
const {config} = RNFetchBlob;

export const saveToCameraRoll = async (obj: {
  url: string;
  type: 'video' | 'image';
}) => {
  const {url, type} = obj;
  const typeText = type === 'video' ? '動画' : '写真';
  const successText = `${typeText}を保存しました`;
  const errorText = `${typeText}の保存に失敗しました`;
  let filePath: string;

  if (Platform.OS === 'android' && !(await hasAndroidStoragePermission())) {
    return;
  }
  if (type === 'video') {
    const file = await config({
      appendExt: 'mp4',
      fileCache: true,
    }).fetch('GET', url, {type: 'video'});
    const data = file.path();
    try {
      filePath = await CameraRoll.save(data, {type: 'video'});
      if (filePath) {
        Alert.alert(successText);
      }
    } catch {
      Alert.alert(errorText);
    }
  } else if (Platform.OS === 'android') {
    const file = await config({
      fileCache: true,
      appendExt: 'png',
    }).fetch('GET', url, {type: 'image'});
    const data = file.path();
    try {
      filePath = await CameraRoll.save(data, {type: 'photo'});
      if (filePath) {
        Alert.alert(successText);
      }
    } catch {
      Alert.alert(errorText);
    }
  } else {
    try {
      filePath = await CameraRoll.save(url);
      if (filePath) {
        Alert.alert(successText);
      }
    } catch (err) {
      console.log(err);
      Alert.alert(errorText);
    }
  }
};
