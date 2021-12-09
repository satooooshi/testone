import React, { useCallback, useEffect, useState } from 'react';
import ReactModal from 'react-modal';
import { User, UserRole } from 'src/types';
import selectUserModalStyles from '@/styles/components/SelectUserModal.module.scss';
import clsx from 'clsx';
import {
  Avatar,
  Button,
  FormControl,
  FormLabel,
  Select,
} from '@chakra-ui/react';
import { useAuthenticate } from 'src/contexts/useAuthenticate';
import { userRoleNameFactory } from 'src/utils/factory/userRoleNameFactory';
import { useAPIGetUsers } from '@/hooks/api/user/useAPIGetUsers';

type EditChatGroupMambersModalProps = {
  isOpen: boolean;
  previousUsers: User[];
  onComplete: (selectedUsers: User[]) => void;
  onCancel: () => void;
};

const EditChatGroupMembersModal: React.FC<EditChatGroupMambersModalProps> = ({
  isOpen,
  previousUsers,
  onComplete,
  onCancel,
}) => {
  const { data: users } = useAPIGetUsers();
  const [selectedRole, setSelectedRole] = useState<UserRole | 'all'>(
    UserRole.INTERNAL_INSTRUCTOR,
  );
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [previousMembers, setPreviousMembers] = useState<User[]>([]);
  const { user: myProfile } = useAuthenticate();

  const toggleSelectedUsers = (user: User) => {
    const isExist = selectedUsers.filter((u) => u.id === user.id).length;
    if (isExist) {
      setSelectedUsers((u) => u.filter((u) => u.id !== user.id));
      return;
    }
    setSelectedUsers((u) => [...u, user]);
  };
  const previousUserIDs = useCallback(() => {
    if (previousMembers) {
      return previousMembers.map((u) => u.id);
    }
    return [];
  }, [previousMembers]);

  useEffect(() => {
    setPreviousMembers(previousUsers);
  }, [previousUsers]);

  return (
    <ReactModal
      ariaHideApp={false}
      style={{ overlay: { zIndex: 110 } }}
      isOpen={isOpen}
      className={selectUserModalStyles.modal}>
      <FormControl className={selectUserModalStyles.user_role_select_wrapper}>
        <FormLabel>タイプ</FormLabel>
        <Select
          bg="white"
          onChange={(e) => setSelectedRole(e.target.value as UserRole | 'all')}
          defaultValue={selectedRole}>
          <option value={'all'}>全て</option>
          <option value={UserRole.ADMIN}>管理者</option>
          <option value={UserRole.EXTERNAL_INSTRUCTOR}>
            {userRoleNameFactory(UserRole.EXTERNAL_INSTRUCTOR)}
          </option>
          <option value={UserRole.INTERNAL_INSTRUCTOR}>
            {userRoleNameFactory(UserRole.INTERNAL_INSTRUCTOR)}
          </option>
          <option value={UserRole.COACH}>コーチ</option>
          <option value={UserRole.COMMON}>一般社員</option>
        </Select>
      </FormControl>
      <div className={selectUserModalStyles.users}>
        {previousMembers
          ?.filter((u) => u.id !== myProfile?.id)
          .map((u) => (
            <a
              key={u.id}
              onClick={() => {
                const isExist = previousUserIDs().includes(u.id);
                if (
                  isExist &&
                  confirm(
                    '既存ユーザーがグループから退室します。よろしいですか？',
                  )
                ) {
                  setPreviousMembers((m) =>
                    m.filter((member) => member.id !== u.id),
                  );
                  return;
                }
              }}
              className={clsx(
                selectUserModalStyles.user_card,
                selectUserModalStyles.selected_member,
              )}>
              <div className={selectUserModalStyles.user_card_left}>
                <Avatar
                  src={u.avatarUrl}
                  className={selectUserModalStyles.user_card_avatar}
                />
                <p className={selectUserModalStyles.user_card_name}>
                  {u.lastName + ' ' + u.firstName}
                </p>
              </div>
            </a>
          ))}
        {selectedRole !== 'all'
          ? users
              ?.filter((u) => u.role === selectedRole)
              .filter((u) => !previousUserIDs().includes(u.id))
              .map((u) => (
                <a
                  key={u.id}
                  onClick={() => {
                    toggleSelectedUsers(u);
                  }}
                  className={clsx(
                    selectUserModalStyles.user_card,
                    selectedUsers?.filter((s) => s.id === u.id).length &&
                      selectUserModalStyles.selected_member,
                  )}>
                  <div className={selectUserModalStyles.user_card_left}>
                    <Avatar
                      src={u.avatarUrl}
                      className={selectUserModalStyles.user_card_avatar}
                    />
                    <p className={selectUserModalStyles.user_card_name}>
                      {u.lastName + ' ' + u.firstName}
                    </p>
                  </div>
                </a>
              ))
          : users
              ?.filter((u) => !previousUserIDs().includes(u.id))
              .map((u) => (
                <a
                  key={u.id}
                  onClick={() => toggleSelectedUsers(u)}
                  className={clsx(
                    selectUserModalStyles.user_card,
                    selectedUsers?.filter((s) => s.id === u.id).length &&
                      selectUserModalStyles.selected_member,
                  )}>
                  <div className={selectUserModalStyles.user_card_left}>
                    <Avatar
                      src={u.avatarUrl}
                      className={selectUserModalStyles.user_card_avatar}
                    />
                    <p className={selectUserModalStyles.user_card_name}>
                      {u.lastName + ' ' + u.firstName}
                    </p>
                  </div>
                </a>
              ))}
      </div>
      <div className={selectUserModalStyles.modal_bottom_buttons}>
        <Button
          size="md"
          width="140px"
          colorScheme="blue"
          borderRadius={5}
          className={selectUserModalStyles.modal_cancel_button}
          onClick={() => {
            setPreviousMembers(previousUsers);
            setSelectedUsers([]);
            onCancel();
          }}>
          キャンセル
        </Button>
        <Button
          size="md"
          width="140px"
          colorScheme="green"
          borderRadius={5}
          onClick={() => {
            onComplete([...previousMembers, ...selectedUsers]);
            setSelectedUsers([]);
          }}>
          完了
        </Button>
      </div>
    </ReactModal>
  );
};

export default EditChatGroupMembersModal;
