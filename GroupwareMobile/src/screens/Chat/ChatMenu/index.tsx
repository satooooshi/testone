import {useNavigation, useRoute} from '@react-navigation/native';
import React from 'react';
import {Alert} from 'react-native';
import {Icon} from 'react-native-magnus';
import ChatMenuRow from '../../../components/chat/ChatMenuRow';
import HeaderWithTextButton from '../../../components/Header';
import WholeContainer from '../../../components/WholeContainer';
import {useAuthenticate} from '../../../contexts/useAuthenticate';
import {useAPIDeleteChatRoom} from '../../../hooks/api/chat/useAPIDeleteChatRoom';
import {useAPILeaveChatRoom} from '../../../hooks/api/chat/useAPILeaveChatRoomURL';
import {
  ChatMenuNavigationProps,
  ChatMenuRouteProps,
} from '../../../types/navigator/drawerScreenProps';

const ChatMenu: React.FC = () => {
  const {user: myProfile} = useAuthenticate();
  const route = useRoute<ChatMenuRouteProps>();
  const navigation = useNavigation<ChatMenuNavigationProps>();
  const {room} = route.params;
  const {mutate: leaveChatGroup} = useAPILeaveChatRoom({
    onSuccess: () => {
      navigation.navigate('ChatStack', {
        screen: 'RoomList',
      });
    },
    onError: () => {
      Alert.alert(
        '退室中にエラーが発生しました。\n時間をおいて再実行してください。',
      );
    },
  });
  const {mutate: deleteChatGroup} = useAPIDeleteChatRoom({
    onSuccess: () => {
      navigation.navigate('ChatStack', {
        screen: 'RoomList',
      });
    },
    onError: () => {
      Alert.alert(
        '削除中にエラーが発生しました。\n時間をおいて再実行してください。',
      );
    },
  });

  return (
    <WholeContainer>
      <HeaderWithTextButton enableBackButton={true} title="メニュー" />
      <ChatMenuRow
        name="ルームを編集"
        icon={<Icon name="setting" fontSize={20} mr={'lg'} color="black" />}
        onPress={() =>
          navigation.navigate('ChatStack', {
            screen: 'EditRoom',
            params: {room},
          })
        }
      />
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
      <ChatMenuRow
        name="退室"
        icon={
          <Icon
            name="ios-arrow-undo-outline"
            fontSize={20}
            fontFamily="Ionicons"
            mr={'lg'}
            color="black"
          />
        }
        onPress={() =>
          Alert.alert('退室してよろしいですか？', undefined, [
            {
              text: 'キャンセル',
              style: 'cancel',
            },
            {
              text: '退室する',
              style: 'destructive',
              onPress: () => {
                leaveChatGroup(room);
              },
            },
          ])
        }
      />
      {myProfile?.id &&
      room?.owner?.filter(u => {
        return u.id === myProfile?.id;
      }).length ? (
        <ChatMenuRow
          name="解散"
          icon={<Icon name="delete" fontSize={20} mr={'lg'} color="black" />}
          onPress={() =>
            Alert.alert('ルームを解散してよろしいですか？', undefined, [
              {
                text: 'キャンセル',
                style: 'cancel',
              },
              {
                text: '解散する',
                style: 'destructive',
                onPress: () => {
                  deleteChatGroup(room);
                },
              },
            ])
          }
        />
      ) : null}
    </WholeContainer>
  );
};

export default ChatMenu;
