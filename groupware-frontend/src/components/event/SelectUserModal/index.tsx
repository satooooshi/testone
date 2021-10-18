import React, { useState } from 'react';
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

type SelectUserModalProps = {
  isOpen: boolean;
  toggleUser: (u: User) => void;
  users: User[];
  selectedUsers: User[];
  onComplete: () => void;
};

type SelectableUserProps = {
  user: User;
  selectedUsers: User[];
  toggleUser: (u: User) => void;
};

const SelectableUser: React.FC<SelectableUserProps> = ({
  user,
  selectedUsers,
  toggleUser,
}) => (
  <a
    onClick={() => toggleUser(user)}
    className={clsx(
      selectUserModalStyles.user_card,
      selectedUsers.filter((s) => s.id === user.id).length &&
        selectUserModalStyles.selected_member,
    )}>
    <div className={selectUserModalStyles.user_card_left}>
      <Avatar
        src={user.avatarUrl}
        className={selectUserModalStyles.user_card_avatar}
      />
      <p className={selectUserModalStyles.user_card_name}>
        {user.lastName + ' ' + user.firstName}
      </p>
    </div>
  </a>
);

const SelectUserModal: React.FC<SelectUserModalProps> = ({
  isOpen,
  toggleUser,
  users,
  selectedUsers,
  onComplete,
}) => {
  const [selectedRole, setSelectedRole] = useState<UserRole | 'all'>(
    UserRole.INSTRUCTOR,
  );
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
          <option value={UserRole.INSTRUCTOR}>講師</option>
          <option value={UserRole.COACH}>コーチ</option>
          <option value={UserRole.COMMON}>一般社員</option>
        </Select>
      </FormControl>
      <div className={selectUserModalStyles.users}>
        {selectedRole !== 'all'
          ? users
              .filter((u) => u.role === selectedRole)
              .map((u) => (
                <SelectableUser
                  key={u.id}
                  user={u}
                  selectedUsers={selectedUsers}
                  toggleUser={toggleUser}
                />
              ))
          : users.map((u) => (
              <SelectableUser
                key={u.id}
                user={u}
                selectedUsers={selectedUsers}
                toggleUser={toggleUser}
              />
            ))}
      </div>
      <div className={selectUserModalStyles.modal_bottom_buttons}>
        <Button
          size="md"
          width="140px"
          colorScheme="green"
          borderRadius={5}
          onClick={onComplete}>
          完了
        </Button>
      </div>
    </ReactModal>
  );
};

export default SelectUserModal;
