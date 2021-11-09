import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../RootStackParamList';
import {RouteProp} from '@react-navigation/native';

type AccountDetailNavigationProps = StackNavigationProp<
  RootStackParamList,
  'AccountDetail'
>;
type AccountDetailRouteProps = RouteProp<RootStackParamList, 'AccountDetail'>;
export type AccountDetailProps = {
  navigation: AccountDetailNavigationProps;
  route: AccountDetailRouteProps;
};
type ProfileNavigationProps = StackNavigationProp<
  RootStackParamList,
  'Profile'
>;
type ProfileRouteProps = RouteProp<RootStackParamList, 'Profile'>;
export type ProfileProps = {
  navigation: ProfileNavigationProps;
  route: ProfileRouteProps;
};
type UpdatePasswordNavigationProps = StackNavigationProp<
  RootStackParamList,
  'UpdatePassword'
>;
type UpdatePasswordRouteProps = RouteProp<RootStackParamList, 'UpdatePassword'>;
export type UpdatePasswordProps = {
  navigation: UpdatePasswordNavigationProps;
  route: UpdatePasswordRouteProps;
};
