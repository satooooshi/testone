import {RouteProp} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {DrawerTabParamList} from '../DrawerTabParamList';
import {RootStackParamList} from '../RootStackParamList';

export type UserTagAdminNavigationProps = StackNavigationProp<
  DrawerTabParamList,
  'AdminStack'
>;
export type UserRegisteringAdminNavigationProps = StackNavigationProp<
  DrawerTabParamList,
  'AdminStack'
>;
export type UserAdminNavigationProps = StackNavigationProp<
  DrawerTabParamList,
  'AdminStack'
>;
export type TagAdminNavigationProps = StackNavigationProp<
  DrawerTabParamList,
  'AdminStack'
>;
export type EditedProfileAdminNavigationProps = StackNavigationProp<
  DrawerTabParamList,
  'AdminStack'
>;
export type EditedProfileRouteProps = RouteProp<
  RootStackParamList,
  'EditedProfile'
>;
