import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../RootStackParamList';
import {RouteProp} from '@react-navigation/native';

export type UserListNavigationProps = StackNavigationProp<
  RootStackParamList,
  'UserList'
>;
type UserListRouteProps = RouteProp<RootStackParamList, 'UserList'>;
export type UserListProps = {
  navigation: UserListNavigationProps;
  route: UserListRouteProps;
};
