import {useNavigation} from '@react-navigation/native';
import React, {useRef, useState} from 'react';
import {TouchableOpacity, Alert, FlatList} from 'react-native';
import {Div, Dropdown, Icon, Tag, Text} from 'react-native-magnus';
import {ActivityIndicator} from 'react-native-paper';
import {useAPIDeleteUser} from '../../../hooks/api/user/useAPIDeleteUser';
import {useAPIUpdateUser} from '../../../hooks/api/user/useAPIUpdateUser';
import {userAdminStyles} from '../../../styles/screen/admin/userAdmin.style';
import {User, UserRole} from '../../../types';
import {blueColor} from '../../../utils/colors';
import {
  defaultDropdownProps,
  defaultDropdownOptionProps,
} from '../../../utils/dropdown/helper';
import {tagColorFactory} from '../../../utils/factory/tagColorFactory';
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
    onSuccess: (_, u: User) => {
      setDeleted(true);
      Alert.alert(`${userNameFactory(u)}さんを削除しました。`);
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
        <Div my={2} bg="white">
          <Div flexDir="row" p="md" w={'100%'} alignItems="center" minH={40}>
            <Div flexDir="row" flex={1} alignItems="center">
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
              <Div ml={10} flex={1}>
                <Div flexDir="row" alignItems="center">
                  <Text mr={4} fontSize={16}>
                    {userNameFactory(user)}
                  </Text>
                  {user.tags ? (
                    <FlatList
                      horizontal
                      data={user.tags || []}
                      renderItem={({item: t}) => (
                        <Tag
                          fontSize={'xs'}
                          ml={4}
                          bg={tagColorFactory(t.type)}>
                          <Text fontSize={10} color="white">
                            {t.name}
                          </Text>
                        </Tag>
                      )}
                    />
                  ) : null}
                </Div>
                <Text fontSize={12} mt={4}>
                  {currentUser.email}
                </Text>
              </Div>
              {/* <Div w={'28%'} mr={'1%'}>
              <DropdownOpenerButton
              onPress={() => {
                dropdownRef.current?.open();
              }}
              name={userRoleNameFactory(currentUser.role)}
              fontSize={13}
              />
            </Div> */}
            </Div>
            <Div flexDir="row" alignItems="center">
              <Div mr={8}>
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate('AdminStack', {
                      screen: 'attendance',
                      params: {id: currentUser.id},
                    })
                  }>
                  <Icon
                    name="time-outline"
                    fontSize={23}
                    color="red900"
                    fontFamily="Ionicons"
                  />
                </TouchableOpacity>
              </Div>
              <Div mr={8}>
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate('AdminStack', {
                      screen: 'EditedProfile',
                      params: {id: currentUser.id},
                    })
                  }>
                  <Icon
                    name="pen"
                    fontFamily={'FontAwesome5'}
                    fontSize={22}
                    color={blueColor}
                  />
                </TouchableOpacity>
              </Div>
              {!loadingDelete ? (
                <TouchableOpacity onPress={() => handleDeleteUser(user)}>
                  <Icon name="delete" fontSize={22} color="tomato" />
                </TouchableOpacity>
              ) : (
                <ActivityIndicator />
              )}
            </Div>
          </Div>
        </Div>
      )}
    </>
  );
};

export default UserRow;
