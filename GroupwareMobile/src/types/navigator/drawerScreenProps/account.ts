import {RouteProp} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {DrawerTabParamList} from '../DrawerTabParamList';
import {RootStackParamList} from '../RootStackParamList';

export type ProfileNavigationProps = StackNavigationProp<
  DrawerTabParamList,
  'AccountStack'
>;
export type UpdatePasswordNavigationProps = StackNavigationProp<
  DrawerTabParamList,
  'AccountStack'
>;
export type AccountDetailNavigationProps = StackNavigationProp<
  DrawerTabParamList,
  'AccountStack'
>;
export type AccountDetailRouteProps = RouteProp<
  RootStackParamList,
  'AccountDetail'
>;
