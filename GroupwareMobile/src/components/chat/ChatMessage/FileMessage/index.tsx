import React from 'react';
import {TouchableOpacity, Platform, Alert, Linking} from 'react-native';
import {Icon, Text} from 'react-native-magnus';
import {fileMessageStyles} from '../../../../styles/component/chat/fileMessage.style';
import {ChatMessage} from '../../../../types';
import FileViewer from 'react-native-file-viewer';
import RNFetchBlob from 'rn-fetch-blob';
const {fs, config} = RNFetchBlob;

type FileMessageProps = {
  message: ChatMessage;
  onLongPress: () => void;
};

const FileMessage: React.FC<FileMessageProps> = ({message, onLongPress}) => {
  const downloadFile = async () => {
    let DownloadDir =
      Platform.OS === 'android' ? fs.dirs.DownloadDir : fs.dirs.DocumentDir;
    const ext = message.content.split(/[#?]/)[0]?.split('.')?.pop()?.trim();
    let options = {
      addAndroidDownloads: {
        useDownloadManager: true, // setting it to true will use the device's native download manager and will be shown in the notification bar.
        notification: true,
        description: 'ファイルをダウンロードします',
        path:
          DownloadDir +
          '/me_' +
          decodeURIComponent(
            (message.content?.match('.+/(.+?)([?#;].*)?$') || [
              '',
              message.content,
            ])[1] || '',
          ), // this is the path where your downloaded file will live in
        appendExt: ext,
      },
      path:
        DownloadDir +
        '/me_' +
        decodeURIComponent(
          (message.content?.match('.+/(.+?)([?#;].*)?$') || [
            '',
            message.content,
          ])[1] || '',
        ), // this is the path where your downloaded file will live in
    };
    const {path} = await config(options).fetch('GET', message.content);
    FileViewer.open(path()).catch(err => {
      if (err?.message === 'No app associated with this mime type') {
        Alert.alert('このファイル形式に対応しているアプリがありません');
      }
    });
  };
  return (
    <TouchableOpacity
      onPress={downloadFile}
      onLongPress={onLongPress}
      style={fileMessageStyles.messageWrapper}>
      <Icon name="filetext1" fontFamily="AntDesign" fontSize={64} mb={'lg'} />
      <Text color="blue700" numberOfLines={1}>
        {
          (message.content?.match('.+/(.+?)([?#;].*)?$') || [
            '',
            message.content,
          ])[1]
        }
      </Text>
    </TouchableOpacity>
  );
};

export default FileMessage;
