import {useNavigation, useRoute} from '@react-navigation/native';
import React from 'react';
import {Icon} from 'react-native-magnus';
import ChatMenuRow from '../../../components/chat/ChatMenuRow';
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
      <ChatMenuRow
        name="ノート"
        icon={<Icon name="filetext1" fontSize={20} mr={'lg'} color="black" />}
        onPress={() =>
          navigation.navigate('ChatStack', {
            screen: 'ChatNotes',
            params: {room},
          })
        }
      />
      <ChatMenuRow
        name="アルバム"
        icon={
          <Icon
            name="photo"
            fontSize={20}
            fontFamily="FontAwesome"
            mr={'lg'}
            color="black"
          />
        }
        onPress={() =>
          navigation.navigate('ChatStack', {
            screen: 'ChatAlbums',
            params: {room},
          })
        }
      />
    </WholeContainer>
  );
};

export default ChatMenu;
