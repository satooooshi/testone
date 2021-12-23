import React from 'react';
import { ChatGroup, User, UserRole, UserRoleInApp } from 'src/types';
import {
  Avatar,
  Box,
  Button,
  ButtonGroup,
  FormControl,
  FormLabel,
  IconButton,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Select,
  Text,
  useToast,
} from '@chakra-ui/react';
import { useAuthenticate } from 'src/contexts/useAuthenticate';
import { userRoleNameFactory } from 'src/utils/factory/userRoleNameFactory';
import { useAPIGetUsers } from '@/hooks/api/user/useAPIGetUsers';
import { useAPIEditMembers } from '@/hooks/api/chat/useAPIEditMembers';
import { useUserRole } from '@/hooks/user/useUserRole';
import { useSelectedUsers } from '@/hooks/user/useSelectedUsers';
import { MdCancel } from 'react-icons/md';
import { userNameFactory } from 'src/utils/factory/userNameFactory';
import { darkFontColor } from 'src/utils/colors';

type EditChatGroupMambersModalProps = {
  room: ChatGroup;
  isOpen: boolean;
  onClose: () => void;
  onComplete: (newGroupInfo: ChatGroup) => void;
};

const UserRenderer = ({
  user,
  onClick,
  isSelected,
}: {
  user: User;
  onClick: (user: User) => void;
  isSelected?: boolean;
}) => {
  return (
    <a
      key={user.id}
      onClick={() => {
        onClick(user);
      }}>
      <Box
        display="flex"
        flexDir="row"
        borderBottom="1px #ececec solid"
        py="8px"
        alignItems="center"
        bg={isSelected ? 'blue.100' : undefined}>
        <Avatar
          src={user.avatarUrl}
          w="40px"
          h="40px"
          rounded="full"
          mr="16px"
        />
        <Text color={darkFontColor}>{userNameFactory(user)}</Text>
      </Box>
    </a>
  );
};

const EditChatGroupMembersModal: React.FC<EditChatGroupMambersModalProps> = ({
  room,
  isOpen,
  onClose: onCancel,
  onComplete,
}) => {
  const { data: users } = useAPIGetUsers();
  const { user: myProfile } = useAuthenticate();
  const { mutate: editMembers } = useAPIEditMembers();
  const toast = useToast();
  const {
    toggleUser,
    isSelected,
    selectedUsers: selectedUsersInModal,
    clear,
  } = useSelectedUsers(room.members || []);
  const { selectedUserRole, selectUserRole, filteredUsers } = useUserRole(
    'All',
    users,
  );

  return (
    <Modal
      onClose={() => {
        onCancel();
        clear();
      }}
      scrollBehavior="inside"
      isOpen={isOpen}>
      <ModalOverlay />
      <ModalContent h="90vh" bg={'#f9fafb'} minW="480px">
        <ModalHeader
          flexDir="row"
          justifyContent="space-between"
          display="flex"
          mr="24px">
          <Text>メンバーを編集</Text>
          <Button
            size="sm"
            flexDir="row"
            onClick={() =>
              editMembers(
                {
                  roomId: room.id,
                  members: selectedUsersInModal as User[],
                },
                {
                  onSuccess: (newGroupInfo) => {
                    onCancel();
                    toast({
                      title: `メンバーを更新しました`,
                      status: 'success',
                      duration: 3000,
                      isClosable: true,
                    });
                    onComplete(newGroupInfo);
                  },
                  onError: () => {
                    alert('エラーが発生しました');
                  },
                },
              )
            }
            mb="8px"
            colorScheme="green"
            alignItems="center">
            <Text display="inline">更新</Text>
          </Button>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Box display="flex" flexDir="row">
            <Box mr="8px">
              <FormControl mb="16px">
                <FormLabel>タイプ</FormLabel>
                <Select
                  bg="white"
                  onChange={(e) =>
                    selectUserRole(e.target.value as UserRoleInApp)
                  }
                  defaultValue={selectedUserRole}>
                  <option value={'All'}>全て</option>
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
              <Box h="80%" overflowY="auto">
                {filteredUsers
                  ?.filter((u) => u.id !== myProfile?.id)
                  .map((u) => (
                    <UserRenderer
                      user={u}
                      key={u.id}
                      onClick={toggleUser}
                      isSelected={isSelected(u)}
                    />
                  ))}
              </Box>
            </Box>
            <Box>
              <Text mb="8px">選択済みのメンバー</Text>
              {selectedUsersInModal?.map((u) => (
                <Box mr={'4px'} mb={'4px'} key={u.id}>
                  <ButtonGroup isAttached size="xs" colorScheme="purple">
                    <Button mr="-px">{userNameFactory(u)}</Button>
                    <IconButton
                      onClick={() => toggleUser(u as User)}
                      aria-label="削除"
                      icon={<MdCancel size={18} />}
                    />
                  </ButtonGroup>
                </Box>
              ))}
            </Box>
          </Box>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default EditChatGroupMembersModal;
