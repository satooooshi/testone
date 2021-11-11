import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../RootStackParamList';
import {RouteProp} from '@react-navigation/native';

type UserAdminNavigationProps = StackNavigationProp<
  RootStackParamList,
  'UserAdmin'
>;
type UserAdminRouteProps = RouteProp<RootStackParamList, 'UserAdmin'>;
export type UserAdminProps = {
  navigation: UserAdminNavigationProps;
  route: UserAdminRouteProps;
};
type UserRegisteringAdminNavigationProps = StackNavigationProp<
  RootStackParamList,
  'UserRegisteringAdmin'
>;
type UserRegisteringAdminRouteProps = RouteProp<
  RootStackParamList,
  'UserRegisteringAdmin'
>;
export type UserRegisteringAdminProps = {
  navigation: UserRegisteringAdminNavigationProps;
  route: UserRegisteringAdminRouteProps;
};
type TagAdminNavigationProps = StackNavigationProp<
  RootStackParamList,
  'TagAdmin'
>;
type TagAdminRouteProps = RouteProp<RootStackParamList, 'TagAdmin'>;
export type TagAdminProps = {
  navigation: TagAdminNavigationProps;
  route: TagAdminRouteProps;
};
type UserTagAdminNavigationProps = StackNavigationProp<
  RootStackParamList,
  'UserTagAdmin'
>;
type UserTagAdminRouteProps = RouteProp<RootStackParamList, 'UserTagAdmin'>;
export type UserTagAdminProps = {
  navigation: UserTagAdminNavigationProps;
  route: UserTagAdminRouteProps;
};
