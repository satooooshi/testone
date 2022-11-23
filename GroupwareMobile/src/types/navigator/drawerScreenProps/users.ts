import {RouteProp} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {DrawerTabParamList} from '../DrawerTabParamList';
import {RootStackParamList} from '../RootStackParamList';

export type UsersListNavigationProps = StackNavigationProp<
  DrawerTabParamList,
  'Users'
>;

export type UsersListRouteProps = RouteProp<RootStackParamList, 'UserList'>;
