import React, { useEffect, useState } from 'react';
import ReactModal from 'react-modal';
import { User, UserRole } from 'src/types';
import selectUserModalStyles from '@/styles/components/SelectUserModal.module.scss';
import {
  Avatar,
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Link,
  Select,
  Text,
} from '@chakra-ui/react';
import { userRoleNameFactory } from 'src/utils/factory/userRoleNameFactory';
import { darkFontColor } from 'src/utils/colors';

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
  <Link
    display="flex"
    flexDir="row"
    borderBottom={'1px'}
    py="8px"
    alignItems="center"
    justifyContent="space-between"
    onClick={() => toggleUser(user)}
    bg={
      selectedUsers.filter((s) => s.id === user.id).length
        ? '#f4f3f3'
        : undefined
    }>
    <Box display="flex" flexDir="row" alignItems="center">
      <Avatar src={user.avatarUrl} w="40px" h="40px" mr="16px" />
      <Text fontSize={darkFontColor}>
        {user.lastName + ' ' + user.firstName}
      </Text>
    </Box>
  </Link>
);

const SelectUserModal: React.FC<SelectUserModalProps> = ({
  isOpen,
  toggleUser,
  users,
  selectedUsers,
  onComplete,
}) => {
  const [selectedRole, setSelectedRole] = useState<UserRole | 'all'>(
    UserRole.INTERNAL_INSTRUCTOR,
  );
  const [modalUsers, setModalUsers] = useState(users);
  const [searchWords, setSearchWords] = useState<RegExpMatchArray | null>();
  const onChangeHandle = (t: string) => {
    const searchWords = t.trim().match(/[^\s]+/g);
    setSearchWords(searchWords);
    return;
  };

  useEffect(() => {
    if (!searchWords) {
      setModalUsers(users);
      return;
    }
    const searchedTags = users.filter((u) => {
      const userName = u.firstName + u.lastName;
      return searchWords.every((w) => userName.indexOf(w) !== -1);
    });
    setModalUsers(searchedTags);
  }, [searchWords, users]);

  return (
    <ReactModal
      ariaHideApp={false}
      style={{ overlay: { zIndex: 110 } }}
      isOpen={isOpen}
      className={selectUserModalStyles.modal}>
      <FormControl className={selectUserModalStyles.user_role_select_wrapper}>
        <FormLabel htmlFor="search">名前で検索</FormLabel>
        <Input
          marginBottom={'8px'}
          onChange={(v) => onChangeHandle(v.target.value)}
          id="search"
        />
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
      <Box display="flex" flexDir="column" mb="16px" h="80%" overflowY="auto">
        {selectedRole !== 'all'
          ? modalUsers
              .filter((u) => u.role === selectedRole)
              .map((u) => (
                <SelectableUser
                  key={u.id}
                  user={u}
                  selectedUsers={selectedUsers}
                  toggleUser={toggleUser}
                />
              ))
          : modalUsers.map((u) => (
              <SelectableUser
                key={u.id}
                user={u}
                selectedUsers={selectedUsers}
                toggleUser={toggleUser}
              />
            ))}
      </Box>
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
