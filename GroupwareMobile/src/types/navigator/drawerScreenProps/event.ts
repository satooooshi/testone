import {RouteProp} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {DrawerTabParamList} from '../DrawerTabParamList';
import {RootStackParamList} from '../RootStackParamList';

export type EventListNavigationProps = StackNavigationProp<
  DrawerTabParamList,
  'EventStack'
>;
export type EventListRouteProps = RouteProp<RootStackParamList, 'EventList'>;

export type EventDetailNavigationProps = StackNavigationProp<
  DrawerTabParamList,
  'EventStack'
>;

export type EventDetailRouteProps = RouteProp<
  RootStackParamList,
  'EventDetail'
>;

export type EventIntroductionNavigationProps = StackNavigationProp<
  DrawerTabParamList,
  'EventStack'
>;

export type EventIntroductionRouteProps = RouteProp<
  RootStackParamList,
  'EventIntroduction'
>;
