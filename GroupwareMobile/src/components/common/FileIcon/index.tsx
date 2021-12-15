import React from 'react';
import {Linking, TouchableHighlight} from 'react-native';
import {Icon, Text} from 'react-native-magnus';
import {fileIconStyles} from '../../../styles/component/common/fileIcon.style';

type FileIconProps = {
  url: string;
  color?: 'white' | 'blue';
};

const FileIcon: React.FC<FileIconProps> = ({url, color = 'white'}) => {
  const downloadFile = async () => {
    Linking.openURL(url);
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
