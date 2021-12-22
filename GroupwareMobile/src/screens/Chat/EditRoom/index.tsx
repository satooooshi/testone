import {useNavigation, useRoute} from '@react-navigation/native';
import React from 'react';
import {Alert} from 'react-native';
import {useAPIEditMembers} from '../../../hooks/api/chat/useAPIEditMembers';
import {useAPIGetRoomDetail} from '../../../hooks/api/chat/useAPIGetRoomDetail';
import {useAPISaveChatGroup} from '../../../hooks/api/chat/useAPISaveChatGroup';
import {useAPIUploadStorage} from '../../../hooks/api/storage/useAPIUploadStorage';
import {useAPIGetUsers} from '../../../hooks/api/user/useAPIGetUsers';
import RoomForm from '../../../templates/chat/room/RoomForm';
import {
  EditRoomNavigationProps,
  EditRoomRouteProps,
} from '../../../types/navigator/drawerScreenProps';

const EditRoom: React.FC = () => {
  const navigation = useNavigation<EditRoomNavigationProps>();
  const {room} = useRoute<EditRoomRouteProps>().params;
  const {data: roomDetail} = useAPIGetRoomDetail(room.id, {
    onError: () => {
      Alert.alert('ルーム情報の取得に失敗しました');
    },
  });
  const {mutate: uploadImage} = useAPIUploadStorage();
  const {data: users} = useAPIGetUsers();
  const {mutate: editMembers} = useAPIEditMembers();
  const headerTitle = 'ルーム編集';
  const {mutate: updateGroup} = useAPISaveChatGroup({
    onSuccess: () => {
      Alert.alert('ルームの更新が完了しました。', undefined, [
        {
          text: 'OK',
          onPress: () => {
            navigation.navigate('ChatStack', {
              screen: 'ChatMenu',
              params: {room},
            });
          },
        },
      ]);
    },
    onError: () => {
      Alert.alert(
        'チャットグループ更新中にエラーが発生しました。\n時間をおいて再実行してください。',
      );
    },
  });
  return (
    <RoomForm
      users={users || []}
      headerTitle={headerTitle}
      initialRoom={roomDetail}
      onSubmit={submittedRoom => {
        if (submittedRoom.members) {
          editMembers({roomId: room.id, members: submittedRoom.members});
          updateGroup({...submittedRoom, members: undefined});
        }
      }}
      onUploadImage={(formData, onSuccessFunc) =>
        uploadImage(formData, {onSuccess: onSuccessFunc})
      }
    />
  );
};

export default EditRoom;
