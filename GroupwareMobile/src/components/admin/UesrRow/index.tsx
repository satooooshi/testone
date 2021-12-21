import {useNavigation} from '@react-navigation/native';
import React, {useRef, useState} from 'react';
import {TouchableOpacity, Alert} from 'react-native';
import {Div, Dropdown, Icon, Text} from 'react-native-magnus';
import {ActivityIndicator} from 'react-native-paper';
import {useAPIDeleteUser} from '../../../hooks/api/user/useAPIDeleteUser';
import {useAPIUpdateUser} from '../../../hooks/api/user/useAPIUpdateUser';
import {userAdminStyles} from '../../../styles/screen/admin/userAdmin.style';
import {User, UserRole} from '../../../types';
import {
  defaultDropdownProps,
  defaultDropdownOptionProps,
} from '../../../utils/dropdown/helper';
import {userNameFactory} from '../../../utils/factory/userNameFactory';
import {userRoleNameFactory} from '../../../utils/factory/userRoleNameFactory';
import DropdownOpenerButton from '../../common/DropdownOpenerButton';
import UserAvatar from '../../common/UserAvatar';

type UserRowProps = {user: User};

const UserRow: React.FC<UserRowProps> = ({user}) => {
  const navigation = useNavigation<any>();
  const dropdownRef = useRef<any | null>(null);
  const [currentUser, setCurrentUser] = useState(user);
  const {mutate: updateUser} = useAPIUpdateUser({
    onSuccess: updatedInfo => {
      setCurrentUser(updatedInfo);
    },
    onError: () => {
      Alert.alert(
        'ユーザーの更新中にエラーが発生しました。\n時間をおいて再度実行してください。',
      );
    },
  });
  const [deleted, setDeleted] = useState(false);
  const {mutate: deleteUser, isLoading: loadingDelete} = useAPIDeleteUser({
    onSuccess: () => {
      setDeleted(true);
    },
    onError: () => {
      Alert.alert(
        'ユーザーの削除中にエラーが発生しました。\n時間をおいて再度実行してください。',
      );
    },
  });
  const handleDeleteUser = (u: User) => {
    Alert.alert(
      `${userNameFactory(u)}さんを削除してよろしいですか？`,
      undefined,
      [
        {
          text: 'はい',
          onPress: () => deleteUser(u),
        },
        {
          text: 'いいえ',
        },
      ],
    );
  };
  return (
    <>
      {!deleted && (
        <>
          <Dropdown {...defaultDropdownProps} ref={dropdownRef}>
            <Dropdown.Option
              {...defaultDropdownOptionProps}
              value={UserRole.ADMIN}
              onPress={() => {
                updateUser({...currentUser, role: UserRole.ADMIN});
              }}>
              {userRoleNameFactory(UserRole.ADMIN)}
            </Dropdown.Option>
            <Dropdown.Option
              {...defaultDropdownOptionProps}
              value={UserRole.COMMON}
              onPress={() => {
                updateUser({...currentUser, role: UserRole.COMMON});
              }}>
              {userRoleNameFactory(UserRole.COMMON)}
            </Dropdown.Option>
            <Dropdown.Option
              {...defaultDropdownOptionProps}
              value={UserRole.COACH}
              onPress={() => {
                updateUser({...currentUser, role: UserRole.COACH});
              }}>
              {userRoleNameFactory(UserRole.COACH)}
            </Dropdown.Option>
            <Dropdown.Option
              {...defaultDropdownOptionProps}
              value={UserRole.INTERNAL_INSTRUCTOR}
              onPress={() => {
                updateUser({
                  ...currentUser,
                  role: UserRole.INTERNAL_INSTRUCTOR,
                });
              }}>
              {userRoleNameFactory(UserRole.INTERNAL_INSTRUCTOR)}
            </Dropdown.Option>
            <Dropdown.Option
              {...defaultDropdownOptionProps}
              value={UserRole.EXTERNAL_INSTRUCTOR}
              onPress={() => {
                updateUser({
                  ...currentUser,
                  role: UserRole.EXTERNAL_INSTRUCTOR,
                });
              }}>
              {userRoleNameFactory(UserRole.EXTERNAL_INSTRUCTOR)}
            </Dropdown.Option>
          </Dropdown>
          <Div
            py="xs"
            w={'100%'}
            borderBottomWidth={1}
            borderBottomColor={'#b0b0b0'}
            flexDir="row"
            alignItems="center"
            minH={40}>
            <TouchableOpacity
              style={userAdminStyles.avatar}
              onPress={() =>
                navigation.navigate('AccountStack', {
                  screen: 'AccountDetail',
                  params: {id: currentUser.id},
                })
              }>
              <UserAvatar w={'100%'} h={'100%'} user={user} />
            </TouchableOpacity>
            <Text w={'29%'} mr={'1%'}>{`${userNameFactory(user)}\n${
              currentUser.email
            }`}</Text>
            <Div w={'39%'} mr={'1%'}>
              <DropdownOpenerButton
                onPress={() => {
                  dropdownRef.current?.open();
                }}
                name={userRoleNameFactory(currentUser.role)}
              />
            </Div>
            {!loadingDelete ? (
              <TouchableOpacity onPress={() => handleDeleteUser(user)}>
                <Icon name="delete" fontSize={26} />
              </TouchableOpacity>
            ) : (
              <ActivityIndicator />
            )}
          </Div>
        </>
      )}
    </>
  );
};

export default UserRow;
