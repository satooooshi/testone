import React, {ReactNode} from 'react';
import {TouchableHighlight} from 'react-native';
import {Div, Icon, Text} from 'react-native-magnus';

type ChatMenuRowProps = {
  icon: ReactNode;
  name: string;
  onPress: () => void;
};

const ChatMenuRow: React.FC<ChatMenuRowProps> = ({icon, name, onPress}) => {
  return (
    <TouchableHighlight onPress={onPress}>
      <Div
        flexDir="row"
        justifyContent="space-between"
        minH={48}
        px={'lg'}
        bg="white"
        alignItems="center">
        <Div flexDir="row">
          {icon}
          <Text fontSize={16}>{name}</Text>
        </Div>
        <Icon name="right" fontSize={16} />
      </Div>
    </TouchableHighlight>
  );
};

export default ChatMenuRow;
