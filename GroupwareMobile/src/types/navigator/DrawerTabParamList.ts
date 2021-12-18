import {NavigatorScreenParams} from '@react-navigation/native';
import {RootStackParamList} from './RootStackParamList';

export type DrawerTabParamList = {
  Home: NavigatorScreenParams<RootStackParamList>;
  EventStack: NavigatorScreenParams<RootStackParamList>;
  WikiStack: NavigatorScreenParams<RootStackParamList>;
  Users: NavigatorScreenParams<RootStackParamList>;
  ChatStack: NavigatorScreenParams<RootStackParamList>;
  AccountStack: NavigatorScreenParams<RootStackParamList>;
  AdminStack: NavigatorScreenParams<RootStackParamList>;
  UserListStack: NavigatorScreenParams<RootStackParamList>;
};
