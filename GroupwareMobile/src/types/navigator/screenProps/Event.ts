import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../RootStackParamList';
import {RouteProp} from '@react-navigation/native';

export type EventListNavigationProps = StackNavigationProp<
  RootStackParamList,
  'EventList'
>;
export type EventListProps = {
  navigation: EventListNavigationProps;
};

type EventDetailNavigationProps = StackNavigationProp<
  RootStackParamList,
  'EventDetail'
>;
type EventDetailRouteProps = RouteProp<RootStackParamList, 'EventDetail'>;
export type EventDetailProps = {
  navigation: EventDetailNavigationProps;
  route: EventDetailRouteProps;
};
