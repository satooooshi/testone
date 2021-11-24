import {RouteProp} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {DrawerTabParamList} from '../DrawerTabParamList';
import {RootStackParamList} from '../RootStackParamList';

export type ChatNavigationProps = StackNavigationProp<
  DrawerTabParamList,
  'ChatStack'
>;

export type ChatRouteProps = RouteProp<RootStackParamList, 'Chat'>;

export type RoomListNavigationProps = StackNavigationProp<
  DrawerTabParamList,
  'ChatStack'
>;

export type RoomListRouteProps = RouteProp<RootStackParamList, 'RoomList'>;

export type NewRoomNavigationProps = StackNavigationProp<
  DrawerTabParamList,
  'ChatStack'
>;

export type ChatMenuNavigationProps = StackNavigationProp<
  DrawerTabParamList,
  'ChatStack'
>;

export type ChatMenuRouteProps = RouteProp<RootStackParamList, 'ChatMenu'>;
