import React, {useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  TouchableHighlight,
} from 'react-native';
import {Icon, Text} from 'react-native-magnus';
import {fileIconStyles} from '../../../styles/component/common/fileIcon.style';
import FileViewer from 'react-native-file-viewer';
import RNFetchBlob from 'rn-fetch-blob';
import {fileNameTransformer} from '../../../utils/factory/fileNameTransformer';
const {fs, config} = RNFetchBlob;

type FileIconProps = {
  name: string;
  url: string;
  color?: 'white' | 'blue';
};

const FileIcon: React.FC<FileIconProps> = ({name, url, color = 'white'}) => {
  const [loading, setLoading] = useState(false);
  const downloadFile = async () => {
    setLoading(true);

    let DownloadDir =
      Platform.OS === 'android' ? fs.dirs.DownloadDir : fs.dirs.DocumentDir;
    const ext = url.split(/[#?]/)[0]?.split('.')?.pop()?.trim();
    let options = {
      addAndroidDownloads: {
        useDownloadManager: true, // setting it to true will use the device's native download manager and will be shown in the notification bar.
        notification: true,
        description: 'ファイルをダウンロードします',
        path: DownloadDir + '/' + name,
        // this is the path where your downloaded file will live in
        appendExt: ext,
      },
      path: DownloadDir + '/' + name,
      // this is the path where your downloaded file will live in
    };
    try {
      const {path} = await config(options).fetch('GET', url);
      setLoading(false);
      FileViewer.open(path()).catch(err => {
        if (err?.message === 'No app associated with this mime type') {
          Alert.alert('このファイル形式に対応しているアプリがありません');
        }
      });
    } catch {
      setLoading(false);
    }
  };
  return (
    <TouchableHighlight
      underlayColor="none"
      onPress={downloadFile}
      style={[fileIconStyles.default, color === 'blue' && fileIconStyles.blue]}>
      <>
        {loading ? (
          <ActivityIndicator />
        ) : (
          <Icon
            name="filetext1"
            fontFamily="AntDesign"
            fontSize={64}
            mb={'lg'}
          />
        )}
        <Text color="blue700" numberOfLines={1}>
          {name}
        </Text>
      </>
    </TouchableHighlight>
  );
};

export default FileIcon;
