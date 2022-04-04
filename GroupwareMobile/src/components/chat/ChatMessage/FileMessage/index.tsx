import React, {useState} from 'react';
import {TouchableOpacity, Platform, Alert} from 'react-native';
import {Icon, Text} from 'react-native-magnus';
import {fileMessageStyles} from '../../../../styles/component/chat/fileMessage.style';
import {ChatMessage} from '../../../../types';
import FileViewer from 'react-native-file-viewer';
import RNFetchBlob from 'rn-fetch-blob';
import {fileNameTransformer} from '../../../../utils/factory/fileNameTransformer';
import {ActivityIndicator} from 'react-native-paper';
const {fs, config} = RNFetchBlob;

type FileMessageProps = {
  message: ChatMessage;
  onLongPress: () => void;
};

const FileMessage: React.FC<FileMessageProps> = ({message, onLongPress}) => {
  const [loading, setLoading] = useState(false);
  const downloadFile = async () => {
    setLoading(true);
    let DownloadDir =
      Platform.OS === 'android' ? fs.dirs.DownloadDir : fs.dirs.DocumentDir;
    const ext = message.content.split(/[#?]/)[0]?.split('.')?.pop()?.trim();
    let options = {
      addAndroidDownloads: {
        useDownloadManager: true, // setting it to true will use the device's native download manager and will be shown in the notification bar.
        notification: true,
        description: 'ファイルをダウンロードします',
        path: DownloadDir + '/' + message.fileName,
        // this is the path where your downloaded file will live in
        appendExt: ext,
      },
      path: DownloadDir + '/' + message.fileName, // this is the path where your downloaded file will live in
    };
    try {
      const {path} = await config(options).fetch('GET', message.content);
      setLoading(false);
      if (path) {
        FileViewer.open(path()).catch(err => {
          if (err?.message === 'No app associated with this mime type') {
            Alert.alert('このファイル形式に対応しているアプリがありません');
          }
        });
      }
    } catch {
      Alert.alert('ファイルダウンロード時にエラーが発生しました');
      setLoading(false);
    }
  };
  return (
    <TouchableOpacity
      onPress={downloadFile}
      onLongPress={onLongPress}
      style={fileMessageStyles.messageWrapper}>
      {loading ? (
        <ActivityIndicator />
      ) : (
        <Icon name="filetext1" fontFamily="AntDesign" fontSize={64} mb={'lg'} />
      )}
      <Text color="blue700" numberOfLines={1}>
        {message.fileName}
      </Text>
    </TouchableOpacity>
  );
};

export default FileMessage;
