import {RouteProp} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {DrawerTabParamList} from '../DrawerTabParamList';
import {RootStackParamList} from '../RootStackParamList';

export type EventListNavigationProps = StackNavigationProp<
  DrawerTabParamList,
  'EventStack'
>;

export type EventDetailNavigationProps = StackNavigationProp<
  DrawerTabParamList,
  'EventStack'
>;

export type EventDetailRouteProps = RouteProp<
  RootStackParamList,
  'EventDetail'
>;
