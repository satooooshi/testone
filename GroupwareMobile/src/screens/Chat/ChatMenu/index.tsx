import {useNavigation, useRoute} from '@react-navigation/native';
import React from 'react';
import {TouchableHighlight} from 'react-native';
import {Div, Icon, Text} from 'react-native-magnus';
import HeaderWithTextButton from '../../../components/Header';
import WholeContainer from '../../../components/WholeContainer';
import {
  ChatMenuNavigationProps,
  ChatMenuRouteProps,
} from '../../../types/navigator/drawerScreenProps';

const ChatMenu: React.FC = () => {
  const route = useRoute<ChatMenuRouteProps>();
  const navigation = useNavigation<ChatMenuNavigationProps>();
  const {room} = route.params;

  return (
    <WholeContainer>
      <HeaderWithTextButton title="メニュー" />
      <TouchableHighlight
        onPress={() =>
          navigation.navigate('ChatStack', {
            screen: 'ChatNotes',
            params: {room},
          })
        }>
        <Div
          flexDir="row"
          justifyContent="space-between"
          minH={48}
          px={'lg'}
          bg="white"
          alignItems="center">
          <Div flexDir="row">
            <Icon name="filetext1" fontSize={20} mr={'lg'} color="black" />
            <Text fontSize={16}>ノート</Text>
          </Div>
          <Icon name="right" fontSize={16} />
        </Div>
      </TouchableHighlight>
    </WholeContainer>
  );
};

export default ChatMenu;
