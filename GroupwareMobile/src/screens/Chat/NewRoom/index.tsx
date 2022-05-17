import {useNavigation, useRoute} from '@react-navigation/native';
import React from 'react';
import {Alert} from 'react-native';
import {useHandleBadge} from '../../../contexts/badge/useHandleBadge';
import {useAPISaveChatGroup} from '../../../hooks/api/chat/useAPISaveChatGroup';
import {useAPIUploadStorage} from '../../../hooks/api/storage/useAPIUploadStorage';
import {useAPIGetUsers} from '../../../hooks/api/user/useAPIGetUsers';
import RoomForm from '../../../templates/chat/room/RoomForm';
import {
  NewRoomNavigationProps,
  NewRoomRouteProps,
} from '../../../types/navigator/drawerScreenProps';

const NewRoom: React.FC = () => {
  const navigation = useNavigation<NewRoomNavigationProps>();
  const route = useRoute<NewRoomRouteProps>();
  const {setNewChatGroup} = useHandleBadge();
  const {mutate: uploadImage} = useAPIUploadStorage();
  const {data: users} = useAPIGetUsers('');
  const headerTitle = 'ルーム新規作成';
  const {mutate: createGroup} = useAPISaveChatGroup({
    onSuccess: createdData => {
      if (createdData.updatedAt === createdData.createdAt) {
        setNewChatGroup(createdData);
      }
      navigation.navigate('ChatStack', {
        screen: 'Chat',
        params: {room: createdData},
        initial: false,
      });
    },
    onError: () => {
      Alert.alert('チャットルームの作成に失敗しました');
    },
  });
  return (
    <RoomForm
      selectedMembers={route.params?.selectedMembers}
      users={users || []}
      headerTitle={headerTitle}
      onSubmit={submittedRoom => createGroup(submittedRoom)}
      onUploadImage={(formData, onSuccessFunc) =>
        uploadImage(formData, {onSuccess: onSuccessFunc})
      }
    />
  );
};

export default NewRoom;
