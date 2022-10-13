import React, { useEffect, useState } from 'react';
import { ChatGroup, User, UserRole, UserRoleInApp } from 'src/types';
import {
  Avatar,
  Box,
  Button,
  ButtonGroup,
  FormControl,
  FormLabel,
  IconButton,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Select,
  Spinner,
  Text,
} from '@chakra-ui/react';
import { useAuthenticate } from 'src/contexts/useAuthenticate';
import { userRoleNameFactory } from 'src/utils/factory/userRoleNameFactory';
import { useAPIGetUsers } from '@/hooks/api/user/useAPIGetUsers';
import { useUserRole } from '@/hooks/user/useUserRole';
import { useSelectedUsers } from '@/hooks/user/useSelectedUsers';
import { MdCancel } from 'react-icons/md';
import { userNameFactory } from 'src/utils/factory/userNameFactory';
import { darkFontColor } from 'src/utils/colors';
import { hideScrollbarCss } from 'src/utils/chakra/hideScrollBar.css';

type EditChatGroupMambersModalProps = {
  room?: ChatGroup;
  isOpen: boolean;
  onClose: () => void;
  onComplete: (selectedUsers: User[]) => void;
  isTalkRoom?: boolean;
  category: 'メンバー' | 'オーナー';
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
  isTalkRoom = false,
  category,
}) => {
  const {
    data: users,
    refetch: refetchGetUsers,
    isLoading,
  } = useAPIGetUsers('ALL', {
    enabled: false,
  });
  const { user: myProfile } = useAuthenticate();
  const {
    toggleUser,
    isSelected,
    selectOwner,
    selectedUsers: selectedUsersInModal,
    setSelectedUsers,
    clear,
  } = useSelectedUsers(
    category === 'メンバー' ? room?.members || [] : room?.owner || [],
  );
  const [modalUsers, setModalUsers] = useState(
    category === 'メンバー' ? users : room?.members,
  );
  const [searchWords, setSearchWords] = useState<RegExpMatchArray | null>();
  const onChangeHandle = (t: string) => {
    const searchWords = t.trim().match(/[^\s]+/g);
    setSearchWords(searchWords);
    return;
  };

  const { selectedUserRole, selectUserRole, filteredUsers } = useUserRole(
    'All',
    modalUsers,
  );

  const handleToggleUser = (selectedUser: User) => {
    if (category === 'オーナー') {
      return selectOwner(selectedUser);
    }
    const isMember = room?.members?.filter((u) => u.id === selectedUser.id);
    if (room?.owner[0].id !== myProfile?.id && isMember?.length) {
      return;
    }
    return toggleUser(selectedUser);
  };

  useEffect(() => {
    const userList = category === 'メンバー' ? users : room?.members;
    if (!searchWords) {
      setModalUsers(userList);
      return;
    }
    const searchedTags = userList?.filter((u) => {
      const userName = u.firstName + u.lastName;
      return searchWords.every((w) => userName.indexOf(w) !== -1);
    });
    setModalUsers(searchedTags);
  }, [searchWords, users, room?.members, category]);

  useEffect(() => {
    if (room?.members && category === 'メンバー') {
      setSelectedUsers(room.members);
    }
    if (room?.owner && category === 'オーナー') {
      setSelectedUsers(room.owner);
    }
  }, [room?.members, room?.owner, setSelectedUsers, category]);

  useEffect(() => {
    if (isOpen) {
      refetchGetUsers();
    } else {
      clear();
    }
  }, [isOpen]);

  return (
    <Modal
      size="lg"
      onClose={() => {
        onCancel();
        setSearchWords(null);
        clear();
      }}
      scrollBehavior="inside"
      isOpen={isOpen}>
      <ModalOverlay />
      <ModalContent h="90vh" bg={'#f9fafb'}>
        <ModalHeader
          flexDir="row"
          justifyContent="space-between"
          display="flex"
          mr="24px">
          <Text>
            {category +
              (room?.owner && room?.owner[0]?.id === myProfile?.id
                ? 'を編集'
                : 'を追加')}
          </Text>
          {(selectedUsersInModal.length !== 0 || !isTalkRoom) && (
            <Button
              size="sm"
              flexDir="row"
              onClick={() => {
                onComplete(selectedUsersInModal as User[]);
                setSearchWords(undefined);
              }}
              mb="8px"
              colorScheme="green"
              alignItems="center">
              <Text display="inline">
                {room ? '更新' : isTalkRoom ? '作成' : '次へ'}
              </Text>
            </Button>
          )}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Box display="flex" flexDir="row" h="100%">
            <Box mr="8px">
              <FormLabel htmlFor="search">ユーザーを検索</FormLabel>
              <Input
                bg="white"
                marginBottom={'8px'}
                onChange={(v) => onChangeHandle(v.target.value)}
                id="search"
              />
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
                  <option value={UserRole.INTERNAL_INSTRUCTOR}>
                    {userRoleNameFactory(UserRole.INTERNAL_INSTRUCTOR)}
                  </option>
                  <option value={UserRole.COACH}>コーチ</option>
                  <option value={UserRole.COMMON}>一般社員</option>
                </Select>
              </FormControl>
              <Box h="90%" overflowY="auto">
                {isLoading ? (
                  <Spinner />
                ) : (
                  (category === 'メンバー'
                    ? filteredUsers?.filter((u) => u.id !== myProfile?.id)
                    : filteredUsers
                  )?.map((u) => (
                    <UserRenderer
                      user={u}
                      key={u.id}
                      onClick={handleToggleUser}
                      isSelected={isSelected(u)}
                    />
                  ))
                )}
              </Box>
            </Box>
            <Box overflowY="auto" css={hideScrollbarCss}>
              <Text mb="8px">{`選択済みの${category}`}</Text>
              {(category === 'メンバー'
                ? selectedUsersInModal?.filter((m) => m.id !== myProfile?.id)
                : selectedUsersInModal
              ).map((u) => (
                <Box mr={'4px'} mb={'4px'} key={u.id}>
                  <ButtonGroup isAttached size="xs" colorScheme="purple">
                    <Button mr="-px">{userNameFactory(u)}</Button>
                    {(room?.owner[0]?.id === myProfile?.id ||
                      room?.members?.filter((m) => m.id === u.id).length ===
                        0) && (
                      <IconButton
                        onClick={() => toggleUser(u as User)}
                        aria-label="削除"
                        icon={<MdCancel size={18} />}
                      />
                    )}
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
