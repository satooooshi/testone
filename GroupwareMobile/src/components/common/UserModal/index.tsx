import React, {useRef} from 'react';
import {FlatList, TouchableOpacity, useWindowDimensions} from 'react-native';
import {
  Button,
  Div,
  Dropdown,
  DropdownProps,
  Icon,
  Modal,
  ModalProps,
  ScrollDiv,
  Text,
} from 'react-native-magnus';
import {DropdownOptionProps} from 'react-native-magnus/lib/typescript/src/ui/dropdown/dropdown.option.type';
import tailwind from 'tailwind-rn';
import {useSelectedUsers} from '../../../hooks/user/useSelectedUsers';
import {useUserRole} from '../../../hooks/user/useUserRole';
import {User, UserRole, UserRoleInApp} from '../../../types';
import {userNameFactory} from '../../../utils/factory/userNameFactory';
import {userRoleNameFactory} from '../../../utils/factory/userRoleNameFactory';
import UserAvatar from '../UserAvatar';

type ModalContainerProps = Omit<ModalProps, 'children'>;

type UserModalProps = ModalContainerProps & {
  onCloseModal: () => void;
  onCompleteModal: (users: User[], reset: () => void) => void;
  users: User[];
  selectedUserRole: UserRoleInApp;
  defaultSelectedUsers?: Partial<User>[];
};

const UserModal: React.FC<UserModalProps> = props => {
  const {
    onCloseModal,
    users,
    onCompleteModal,
    selectedUserRole: alreadySelectedUserRole,
    defaultSelectedUsers,
  } = props;
  const {
    toggleUser,
    isSelected,
    selectedUsers: selectedUsersInModal,
    clear,
  } = useSelectedUsers(defaultSelectedUsers || []);
  const {selectedUserRole, selectUserRole, filteredUsers} = useUserRole(
    alreadySelectedUserRole,
    users,
  );
  const dropdownRef = useRef<any | null>(null);
  const defaultDropdownProps: Partial<DropdownProps> = {
    m: 'md',
    pb: 'md',
    showSwipeIndicator: false,
    roundedTop: 'xl',
  };
  const defaultDropdownOptionProps: Partial<DropdownOptionProps> = {
    bg: 'gray100',
    color: 'blue600',
    py: 'lg',
    px: 'xl',
    borderBottomWidth: 1,
    borderBottomColor: 'gray200',
    justifyContent: 'center',
    roundedTop: 'lg',
  };
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
          onCloseModal();
        }}>
        <Icon color="black" name="close" />
      </Button>
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
      <FlatList
        horizontal
        data={selectedUsersInModal}
        renderItem={({item}) => (
          <Div mr={'md'}>
            <TouchableOpacity
              // eslint-disable-next-line react-native/no-inline-styles
              style={{...tailwind('absolute top-0 right-0'), zIndex: 50}}
              onPress={() => {
                toggleUser(item as User);
              }}>
              <Icon color="black" name="close" />
            </TouchableOpacity>
            <Div h={120}>
              <UserAvatar user={item} h={64} w={64} />
              <Text>{userNameFactory(item)}</Text>
            </Div>
          </Div>
        )}
      />
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
        <Dropdown.Option
          {...defaultDropdownOptionProps}
          onPress={() => selectUserRole(UserRole.EXTERNAL_INSTRUCTOR)}
          value={UserRole.EXTERNAL_INSTRUCTOR}>
          {userRoleNameFactory(UserRole.EXTERNAL_INSTRUCTOR)}
        </Dropdown.Option>
      </Dropdown>
      <ScrollDiv>
        {filteredUsers?.map(u => (
          <TouchableOpacity key={u.id} onPress={() => toggleUser(u)}>
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

export default UserModal;
