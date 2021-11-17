import React from 'react';
import {TouchableOpacity, Platform, Alert, Linking} from 'react-native';
import {Icon, Text} from 'react-native-magnus';
import {fileMessageStyles} from '../../../../styles/component/chat/fileMessage.style';
import {ChatMessage} from '../../../../types';

type FileMessageProps = {
  onPress: () => void;
  message: ChatMessage;
};

const FileMessage: React.FC<FileMessageProps> = ({onPress, message}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
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
