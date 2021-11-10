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
