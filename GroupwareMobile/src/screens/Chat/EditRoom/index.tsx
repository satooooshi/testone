import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import React, {useCallback} from 'react';
import {Alert} from 'react-native';
import {useHandleBadge} from '../../../contexts/badge/useHandleBadge';
import {useAPIGetRoomDetail} from '../../../hooks/api/chat/useAPIGetRoomDetail';
import {useAPIUpdateChatGroup} from '../../../hooks/api/chat/useAPIUpdateChatGroup';
import {useAPIUploadStorage} from '../../../hooks/api/storage/useAPIUploadStorage';
import {useAPIGetUsers} from '../../../hooks/api/user/useAPIGetUsers';
import RoomForm from '../../../templates/chat/room/RoomForm';
import {ChatGroup} from '../../../types';
import {
  EditRoomNavigationProps,
  EditRoomRouteProps,
} from '../../../types/navigator/drawerScreenProps';
import {socket} from '../../../utils/socket';

const EditRoom: React.FC = () => {
  const navigation = useNavigation<EditRoomNavigationProps>();
  const {editChatGroup} = useHandleBadge();
  const {room} = useRoute<EditRoomRouteProps>().params;

  const {data: roomDetail, refetch} = useAPIGetRoomDetail(room.id, {
    onError: () => {
      Alert.alert('ルーム情報の取得に失敗しました');
    },
  });
  const {mutate: uploadImage} = useAPIUploadStorage();
  const {data: users} = useAPIGetUsers('ALL');
  const headerTitle = 'ルーム編集';

  const {mutate: updateGroup} = useAPIUpdateChatGroup({
    onSuccess: data => {
      editChatGroup(data.room);
      for (const msg of data.systemMessage) {
        socket.emit('message', {type: 'send', chatMessage: msg});
      }
      Alert.alert('ルームの更新が完了しました。', undefined, [
        {
          text: 'OK',
          onPress: () => {
            navigation.navigate('ChatStack', {
              screen: 'ChatMenu',
              params: {room: data.room},
            });
          },
        },
      ]);
    },
    onError: () => {
      Alert.alert(
        'チャットルーム更新中にエラーが発生しました。\n時間をおいて再実行してください。',
      );
    },
  });

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  return (
    <RoomForm
      users={users || []}
      headerTitle={headerTitle}
      initialRoom={roomDetail}
      onSubmit={submittedRoom => {
        updateGroup(submittedRoom as ChatGroup);
      }}
      onUploadImage={(formData, onSuccessFunc) =>
        uploadImage(formData, {onSuccess: onSuccessFunc})
      }
    />
  );
};

export default EditRoom;
