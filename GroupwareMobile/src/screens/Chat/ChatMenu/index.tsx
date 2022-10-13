import {useNavigation, useRoute} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
import {Alert} from 'react-native';
import {Icon} from 'react-native-magnus';
import ChatMenuRow from '../../../components/chat/ChatMenuRow';
import HeaderWithTextButton from '../../../components/Header';
import WholeContainer from '../../../components/WholeContainer';
import {useAPIDeleteChatRoom} from '../../../hooks/api/chat/useAPIDeleteChatRoom';
import AddUsersForm from '../../../templates/chat/room/AddUsersForm';
import {useHandleBadge} from '../../../contexts/badge/useHandleBadge';
import {useAuthenticate} from '../../../contexts/useAuthenticate';
import {useAPILeaveChatRoom} from '../../../hooks/api/chat/useAPILeaveChatRoomURL';
import {useAPIUpdateChatGroup} from '../../../hooks/api/chat/useAPIUpdateChatGroup';
import {userAdminStyles} from '../../../styles/screen/admin/userAdmin.style';
import {RoomType, User} from '../../../types';
import {
  ChatMenuNavigationProps,
  ChatMenuRouteProps,
} from '../../../types/navigator/drawerScreenProps';

const ChatMenu: React.FC = () => {
  const {user: myProfile} = useAuthenticate();
  const route = useRoute<ChatMenuRouteProps>();
  const navigation = useNavigation<ChatMenuNavigationProps>();
  const {room, removeCache} = route.params;
  const {user} = useAuthenticate();
  const [visibleUserModal, setVisibleUserModal] = useState(false);
  const [isMute, setIsMute] = useState(false);
  const {editChatGroup} = useHandleBadge();

  // const {mutate: updateGroup} = useAPIUpdateChatGroup({
  //   onSuccess: data => {
  //     editChatGroup(data.room);
  //     setIsMute(!isMute);
  //   },
  //   onError: () => {
  //     Alert.alert(
  //       'チャットルーム更新中にエラーが発生しました。\n時間をおいて再実行してください。',
  //     );
  //   },
  // });
  const {mutate: leaveChatGroup} = useAPILeaveChatRoom({
    onSuccess: () => {
      editChatGroup({
        ...room,
        members: room.members?.filter(u => u.id !== user?.id),
      });
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

  useEffect(() => {
    if (
      room?.muteUsers &&
      room.muteUsers.filter(u => u.id === user?.id).length
    ) {
      setIsMute(true);
    }
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room.muteUsers]);

  const isPersonal = room.roomType === RoomType.PERSONAL;

  return (
    <WholeContainer>
      <AddUsersForm
        visibleUserModal={visibleUserModal}
        closeUserModal={() => setVisibleUserModal(false)}
        room={room}
      />
      <HeaderWithTextButton enableBackButton={true} title="メニュー" />
      {/* <ChatMenuRow
        name={isMute ? '通知をオン' : '通知をオフ'}
        icon={
          isMute ? (
            <Icon
              name="volume-high"
              fontFamily="Ionicons"
              fontSize={20}
              mr={'lg'}
              color="black"
            />
          ) : (
            <Icon
              name="volume-mute"
              fontFamily="Ionicons"
              fontSize={20}
              mr={'lg'}
              color="black"
            />
          )
        }
        onPress={() => {
          if (isMute && room.muteUsers) {
            updateGroup({
              ...room,
              muteUsers: room.muteUsers.filter(u => u.id !== user?.id),
            });
          } else {
            const myself = room.members?.filter(m => m.id === user?.id);
            if (myself) {
              const muteUsers = room.muteUsers?.length
                ? room.muteUsers.splice(0, 0, myself[0])
                : myself;
              updateGroup({...room, muteUsers: muteUsers});
            }
          }
        }}
      /> */}
      {!isPersonal &&
        (myProfile?.id && room?.owner[0]?.id === myProfile?.id ? (
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
        ) : (
          <ChatMenuRow
            name="メンバーを追加"
            icon={<Icon name="setting" fontSize={20} mr={'lg'} color="black" />}
            onPress={() => setVisibleUserModal(true)}
          />
        ))}
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
        name="メッセージのキャッシュ削除"
        icon={<Icon name="delete" fontSize={20} mr={'lg'} color="black" />}
        onPress={() =>
          Alert.alert('メッセージのキャッシュを削除してよろしいですか？', '', [
            {
              text: 'いいえ',
              style: 'cancel',
            },
            {
              text: 'はい',
              onPress: () => {
                if (removeCache) {
                  removeCache();
                }
              },
              style: 'destructive',
            },
          ])
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

      {!isPersonal && myProfile?.id && room?.owner[0]?.id === myProfile?.id ? (
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
