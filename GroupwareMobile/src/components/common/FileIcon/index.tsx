import React from 'react';
import {Platform, TouchableHighlight} from 'react-native';
import {Icon, Text} from 'react-native-magnus';
import {fileIconStyles} from '../../../styles/component/common/fileIcon.style';
import FileViewer from 'react-native-file-viewer';
import RNFetchBlob from 'rn-fetch-blob';
const {fs, config} = RNFetchBlob;

type FileIconProps = {
  url: string;
  color?: 'white' | 'blue';
};

const FileIcon: React.FC<FileIconProps> = ({url, color = 'white'}) => {
  const downloadFile = async () => {
    const date = new Date();
    let DownloadDir =
      Platform.OS === 'android' ? fs.dirs.DownloadDir : fs.dirs.DocumentDir;
    const ext = url.split(/[#?]/)[0]?.split('.')?.pop()?.trim();
    let options = {
      addAndroidDownloads: {
        useDownloadManager: true, // setting it to true will use the device's native download manager and will be shown in the notification bar.
        notification: true,
        description: 'ファイルをダウンロードします',
        path:
          DownloadDir +
          '/me_' +
          Math.floor(date.getTime() + date.getSeconds() / 2) +
          `.${ext}`, // this is the path where your downloaded file will live in
      },
      path:
        DownloadDir +
        '/me_' +
        Math.floor(date.getTime() + date.getSeconds() / 2) +
        `.${ext}`, // this is the path where your downloaded file will live in
    };
    const {path} = await config(options).fetch('GET', url, {type: 'photo'});
    FileViewer.open(path());
  };
  return (
    <TouchableHighlight
      underlayColor="none"
      onPress={downloadFile}
      style={[
        fileIconStyles.default,
        color === 'blue' && fileIconStyles.default,
      ]}>
      <>
        <Icon name="filetext1" fontFamily="AntDesign" fontSize={64} mb={'lg'} />
        <Text color="blue700" numberOfLines={1}>
          {decodeURIComponent(
            (url?.match('.+/(.+?)([?#;].*)?$') || ['', url])[1] || '',
          )}
        </Text>
      </>
    </TouchableHighlight>
  );
};

export default FileIcon;
