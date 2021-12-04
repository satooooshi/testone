import {useNavigation, useRoute} from '@react-navigation/native';
import React from 'react';
import {Alert} from 'react-native';
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
  const {mutate: uploadImage} = useAPIUploadStorage();
  const {data: users} = useAPIGetUsers();
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
  });
  return (
    <RoomForm
      users={users || []}
      headerTitle={headerTitle}
      initialRoom={room}
      onSubmit={submittedRoom => updateGroup(submittedRoom)}
      onUploadImage={(formData, onSuccessFunc) =>
        uploadImage(formData, {onSuccess: onSuccessFunc})
      }
    />
  );
};

export default EditRoom;
