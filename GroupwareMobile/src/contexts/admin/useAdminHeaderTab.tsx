import {useNavigation} from '@react-navigation/core';
import {Tab} from '../../components/Header/HeaderTemplate';
import {UserRole} from '../../types';
import {useAuthenticate} from '../useAuthenticate';

export const useAdminHeaderTab = (): Tab[] => {
  const navigation = useNavigation<any>();
  const {user} = useAuthenticate();
  const isAdmin = user?.role === UserRole.ADMIN;

  if (!isAdmin) {
    return [
      {
        name: 'タグ管理',
        onPress: () => navigation.navigate('AdminStack', {screen: 'TagAdmin'}),
      },
      {
        name: 'タグ管理(ユーザー)',
        onPress: () =>
          navigation.navigate('AdminStack', {screen: 'UserTagAdmin'}),
      },
    ];
  }
  return [
    {
      name: 'ユーザー管理',
      onPress: () => navigation.navigate('AdminStack', {screen: 'UserAdmin'}),
    },
    {
      name: 'ユーザー作成',
      onPress: () =>
        navigation.navigate('AdminStack', {screen: 'UserRegisteringAdmin'}),
    },
    {
      name: 'タグ管理',
      onPress: () => navigation.navigate('AdminStack', {screen: 'TagAdmin'}),
    },
    {
      name: 'タグ管理(ユーザー)',
      onPress: () =>
        navigation.navigate('AdminStack', {screen: 'UserTagAdmin'}),
    },
  ];
};
