import {Alert, Platform} from 'react-native';
import RNFetchBlob from 'rn-fetch-blob';
const {fs, config} = RNFetchBlob;

export const getFileUrl = async (name: string, url: string) => {
  let DownloadDir =
    Platform.OS === 'android' ? fs.dirs.DownloadDir : fs.dirs.DocumentDir;
  const ext = name.split(/[#?]/)[0]?.split('.')?.pop()?.trim();
  let options = {
    path: DownloadDir + '/' + name, // this is the path where your downloaded file will live in
    addAndroidDownloads: {
      title: DownloadDir + '/' + name,
      useDownloadManager: false, // setting it to true will use the device's native download manager and will be shown in the notification bar.
      // useDownloadManager: true,にするとエラー
      notification: true,
      description: 'ファイルをダウンロードします',
      // path: DownloadDir + '/' + name,
      // this is the path where your downloaded file will live in
      appendExt: ext,
    },
  };
  try {
    const {path} = await config(options).fetch('GET', url);
    return path();
  } catch {
    Alert.alert('ファイル情報取得時にエラーが発生しました');
    return undefined;
  }
};
