import {useNavigation} from '@react-navigation/native';
import React, {useState} from 'react';
import {Alert} from 'react-native';
import RoomMemberModal from '../../../../components/chat/RoomMemberModal';
import UserModal from '../../../../components/common/UserModal';
import {useAuthenticate} from '../../../../contexts/useAuthenticate';
import {useAPIUpdateChatGroup} from '../../../../hooks/api/chat/useAPIUpdateChatGroup';
import {useAPIGetUsers} from '../../../../hooks/api/user/useAPIGetUsers';
import {useUserRole} from '../../../../hooks/user/useUserRole';
import {ChatGroup} from '../../../../types';

type RoomFormProps = {
  room: ChatGroup;
  visibleUserModal: boolean;
  closeUserModal: () => void;
};

const AddUsersForm: React.FC<RoomFormProps> = ({
  room,
  visibleUserModal,
  closeUserModal,
}) => {
  const {user: myProfile} = useAuthenticate();
  const navigation = useNavigation<any>();
  const {data: users} = useAPIGetUsers('ALL');
  const {selectedUserRole, filteredUsers} = useUserRole('All', users);

  const {mutate: updateGroup} = useAPIUpdateChatGroup({
    onSuccess: updatedRoom => {
      Alert.alert('メンバーを追加しました。', undefined, [
        {
          text: 'OK',
          onPress: () => {
            navigation.navigate('ChatStack', {
              screen: 'ChatRoom',
              params: {room: updatedRoom},
            });
          },
        },
      ]);
    },
    onError: () => {
      Alert.alert(
        'メンバー追加中にエラーが発生しました。\n時間をおいて再実行してください。',
      );
    },
  });

  return (
    <RoomMemberModal
      isVisible={visibleUserModal}
      isChatGroupOwner={room?.owner[0]?.id === myProfile?.id}
      users={filteredUsers?.filter(u => u.id !== myProfile?.id) || []}
      onCloseModal={() => closeUserModal()}
      selectedUserRole={selectedUserRole}
      defaultSelectedUsers={
        room.members?.filter(u => u.id !== myProfile?.id) || []
      }
      onCompleteModal={selectedUsers =>
        updateGroup({...room, members: selectedUsers})
      }
    />
  );
};

export default AddUsersForm;
