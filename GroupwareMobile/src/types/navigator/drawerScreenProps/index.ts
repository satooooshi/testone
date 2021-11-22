import {StackNavigationProp} from '@react-navigation/stack';
import {DrawerTabParamList} from '../DrawerTabParamList';

export * from './wiki';
export * from './event';
export * from './chat';
export * from './users';
export * from './account';
export * from './admin';

export type UsersStackNavigationProps = StackNavigationProp<
  DrawerTabParamList,
  'Users'
>;
export type UsersProps = {
  navigation: UsersStackNavigationProps;
};

export type ChatStackNavigationProps = StackNavigationProp<
  DrawerTabParamList,
  'ChatStack'
>;
export type ChatStackProps = {
  navigation: ChatStackNavigationProps;
};

export type AccountStackNavigationProps = StackNavigationProp<
  DrawerTabParamList,
  'AccountStack'
>;
export type AccountStackProps = {
  navigation: AccountStackNavigationProps;
};

export type AdminStackNavigationProps = StackNavigationProp<
  DrawerTabParamList,
  'AdminStack'
>;
export type AdminStackProps = {
  navigation: AdminStackNavigationProps;
};
