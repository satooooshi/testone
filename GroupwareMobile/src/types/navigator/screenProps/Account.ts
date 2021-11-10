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
