import React, {useEffect, useRef, useState} from 'react';
import {FlatList, TouchableOpacity, useWindowDimensions} from 'react-native';
import {
  Button,
  Div,
  Dropdown,
  Icon,
  Input,
  Modal,
  ModalProps,
  ScrollDiv,
  Text,
} from 'react-native-magnus';
import {
  defaultDropdownProps,
  defaultDropdownOptionProps,
} from '../../../utils/dropdown/helper';
import tailwind from 'tailwind-rn';
import {useSelectedUsers} from '../../../hooks/user/useSelectedUsers';
import {useUserRole} from '../../../hooks/user/useUserRole';
import {User, UserRole, UserRoleInApp} from '../../../types';
import {userNameFactory} from '../../../utils/factory/userNameFactory';
import {userRoleNameFactory} from '../../../utils/factory/userRoleNameFactory';
import UserAvatar from '../../common/UserAvatar';

type ModalContainerProps = Omit<ModalProps, 'children'>;

type UserModalProps = ModalContainerProps & {
  isChatGroupOwner: boolean;
  isOwnerEdit?: boolean;
  onCloseModal: () => void;
  onCompleteModal: (users: User[], reset: () => void) => void;
  users: User[];
  selectedUserRole: UserRoleInApp;
  defaultSelectedUsers?: Partial<User>[];
};

const RoomMemberModal: React.FC<UserModalProps> = props => {
  const {
    isChatGroupOwner,
    onCloseModal,
    isOwnerEdit,
    users,
    onCompleteModal,
    selectedUserRole: alreadySelectedUserRole,
    defaultSelectedUsers,
  } = props;
  const {
    toggleUser,
    isSelected,
    selectOwner,
    selectedUsers: selectedUsersInModal,
    clear,
  } = useSelectedUsers(defaultSelectedUsers || []);
  const [searchWords, setSearchWords] = useState<RegExpMatchArray | null>();
  const [modalUsers, setModalUsers] = useState<User[]>(users);
  const {selectedUserRole, selectUserRole, filteredUsers} = useUserRole(
    alreadySelectedUserRole,
    modalUsers,
  );

  const onChangeHandle = (t: string) => {
    const words = t
      .trim()
      .toLowerCase()
      .match(/[^\s]+/g);
    setSearchWords(words);
    return;
  };

  const handleToggleUser = (selectedUser: User) => {
    if (isOwnerEdit) {
      return selectOwner(selectedUser);
    }
    const isMember = defaultSelectedUsers?.filter(
      u => u.id === selectedUser.id,
    );
    if (!isOwnerEdit && isMember?.length) {
      return;
    }
    return toggleUser(selectedUser);
  };

  const onCloseUserModal = () => {
    onCloseModal();
    setModalUsers([]);
  };
  useEffect(() => {
    if (!searchWords) {
      setModalUsers(users);
      return;
    }
    const searchedTags = users.filter(u => {
      const userName = u.firstName + u.lastName;
      return searchWords.every(w => userName.indexOf(w) !== -1);
    });
    setModalUsers(searchedTags);
  }, [searchWords, users]);

  const dropdownRef = useRef<any | null>(null);
  const {width: windowWidth} = useWindowDimensions();
  return (
    <Modal {...props}>
      <Button
        bg="purple600"
        position="absolute"
        right={10}
        bottom={10}
        h={60}
        zIndex={20}
        rounded="circle"
        w={60}
        onPress={() => {
          onCompleteModal(selectedUsersInModal as User[], clear);
          onCloseModal();
        }}>
        <Icon color="white" fontSize="6xl" name="check" />
      </Button>
      <Button
        bg="gray400"
        h={35}
        w={35}
        right={15}
        alignSelf="flex-end"
        rounded="circle"
        onPress={() => {
          clear();
          onCloseUserModal();
        }}>
        <Icon color="black" name="close" />
      </Button>
      <Text mx={8}>名前で検索</Text>
      <Input
        mx={8}
        autoCapitalize="none"
        mb={8}
        onChangeText={v => onChangeHandle(v)}
      />
      <Div
        flexDir="column"
        alignItems="flex-start"
        alignSelf="center"
        mb={'lg'}>
        <Text fontSize={16} mb={'sm'}>
          社員区分を選択
        </Text>
        <Button
          alignSelf="center"
          block
          w={windowWidth * 0.9}
          suffix={
            <Icon position="absolute" right={8} name="down" color="white" />
          }
          bg="blue600"
          p={12}
          color="white"
          onPress={() => dropdownRef.current?.open()}
          rounded="md">
          {userRoleNameFactory(selectedUserRole)}
        </Button>
      </Div>
      <Div w={windowWidth * 0.9} alignSelf="center" mb="xs">
        <Text
          fontWeight="bold"
          fontSize={16}>{`${selectedUsersInModal?.length}人選択中`}</Text>
      </Div>

      <Div>
        <FlatList
          horizontal
          data={selectedUsersInModal}
          renderItem={({item}) => (
            <Div mr={'md'}>
              {isChatGroupOwner !== false && (
                <TouchableOpacity
                  // eslint-disable-next-line react-native/no-inline-styles
                  style={{...tailwind('absolute top-0 right-0'), zIndex: 50}}
                  onPress={() => {
                    toggleUser(item as User);
                  }}>
                  <Icon
                    color="black"
                    name="close"
                    bg="gray300"
                    rounded="circle"
                  />
                </TouchableOpacity>
              )}
              <Div alignItems="center">
                <UserAvatar user={item} h={64} w={64} />
                <Text>{userNameFactory(item)}</Text>
              </Div>
            </Div>
          )}
        />
      </Div>

      <Dropdown
        {...defaultDropdownProps}
        title="入力形式を選択"
        ref={dropdownRef}>
        <Dropdown.Option
          {...defaultDropdownOptionProps}
          onPress={() => selectUserRole('All')}
          value={'All'}>
          全て
        </Dropdown.Option>
        <Dropdown.Option
          {...defaultDropdownOptionProps}
          onPress={() => selectUserRole(UserRole.ADMIN)}
          value={UserRole.ADMIN}>
          {userRoleNameFactory(UserRole.ADMIN)}
        </Dropdown.Option>
        <Dropdown.Option
          {...defaultDropdownOptionProps}
          onPress={() => selectUserRole(UserRole.COMMON)}
          value={UserRole.COMMON}>
          {userRoleNameFactory(UserRole.COMMON)}
        </Dropdown.Option>
        <Dropdown.Option
          {...defaultDropdownOptionProps}
          onPress={() => selectUserRole(UserRole.COACH)}
          value={UserRole.COACH}>
          {userRoleNameFactory(UserRole.COACH)}
        </Dropdown.Option>
        <Dropdown.Option
          {...defaultDropdownOptionProps}
          onPress={() => selectUserRole(UserRole.INTERNAL_INSTRUCTOR)}
          value={UserRole.INTERNAL_INSTRUCTOR}>
          {userRoleNameFactory(UserRole.INTERNAL_INSTRUCTOR)}
        </Dropdown.Option>
      </Dropdown>
      <ScrollDiv contentContainerStyle={{width: '100%'}}>
        {filteredUsers?.map(u => (
          <TouchableOpacity key={u.id} onPress={() => handleToggleUser(u)}>
            <Div
              w={windowWidth}
              minH={40}
              bg={isSelected(u) ? 'gray300' : 'white'}
              borderBottomWidth={1}
              px={10}
              justifyContent="center"
              borderBottomColor="gray500">
              <Text fontSize={16}>{userNameFactory(u)}</Text>
            </Div>
          </TouchableOpacity>
        ))}
      </ScrollDiv>
    </Modal>
  );
};

export default RoomMemberModal;
