import {RouteProp} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../RootStackParamList';

type RoomListNavigationProps = StackNavigationProp<
  RootStackParamList,
  'RoomList'
>;
type RoomListRouteProps = RouteProp<RootStackParamList, 'RoomList'>;
export type RoomListProps = {
  navigation: RoomListNavigationProps;
  route: RoomListRouteProps;
};

type ChatNavigationProps = StackNavigationProp<RootStackParamList, 'Chat'>;
type ChatRouteProps = RouteProp<RootStackParamList, 'Chat'>;
export type ChatProps = {
  navigation: ChatNavigationProps;
  route: ChatRouteProps;
};
