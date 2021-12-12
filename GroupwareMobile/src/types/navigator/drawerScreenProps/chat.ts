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

export type EditRoomNavigationProps = StackNavigationProp<
  DrawerTabParamList,
  'ChatStack'
>;

export type EditRoomRouteProps = RouteProp<RootStackParamList, 'EditRoom'>;

export type ChatMenuNavigationProps = StackNavigationProp<
  DrawerTabParamList,
  'ChatStack'
>;

export type ChatMenuRouteProps = RouteProp<RootStackParamList, 'ChatMenu'>;

export type ChatNotesNavigationProps = StackNavigationProp<
  DrawerTabParamList,
  'ChatStack'
>;

export type ChatNotesRouteProps = RouteProp<RootStackParamList, 'ChatNotes'>;

export type PostChatNotesNavigationProps = StackNavigationProp<
  DrawerTabParamList,
  'ChatStack'
>;

export type PostChatNotesRouteProps = RouteProp<
  RootStackParamList,
  'PostChatNote'
>;

export type EditChatNotesNavigationProps = StackNavigationProp<
  DrawerTabParamList,
  'ChatStack'
>;
export type EditChatNotesRouteProps = RouteProp<
  RootStackParamList,
  'EditChatNote'
>;

export type ChatAlbumsNavigationProps = StackNavigationProp<
  DrawerTabParamList,
  'ChatStack'
>;

export type ChatAlbumsRouteProps = RouteProp<RootStackParamList, 'ChatAlbums'>;

export type PostChatAlbumsNavigationProps = StackNavigationProp<
  DrawerTabParamList,
  'ChatStack'
>;

export type PostChatAlbumsRouteProps = RouteProp<
  RootStackParamList,
  'PostChatAlbum'
>;

export type ChatAlbumDetailNavigationProps = StackNavigationProp<
  DrawerTabParamList,
  'ChatStack'
>;

export type ChatAlbumDetailRouteProps = RouteProp<
  RootStackParamList,
  'ChatAlbumDetail'
>;

export type EditChatAlbumNavigationProps = StackNavigationProp<
  DrawerTabParamList,
  'ChatStack'
>;

export type EditChatAlbumRouteProps = RouteProp<
  RootStackParamList,
  'EditChatAlbum'
>;
